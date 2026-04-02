import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

// Debug logs to verify environment variables are loaded
console.log('🔧 Passport Config - Google Client ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Present' : '❌ Missing');
console.log('🔧 Passport Config - GitHub Client ID:', process.env.GITHUB_CLIENT_ID ? '✅ Present' : '❌ Missing');

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5001/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('📧 Google email:', profile.emails[0].value);
      
      // Check if user exists
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (!user) {
        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0]?.value,
          role: 'SDR',
          company: '',
          isActive: true,
          isEmailVerified: true
        });
        console.log('✅ New user created via Google');
      } else if (!user.googleId) {
        // Link Google account to existing user
        user.googleId = profile.id;
        await user.save();
        console.log('✅ Google account linked to existing user');
      }
      
      return done(null, { user });
    } catch (error) {
      console.error('❌ Google strategy error:', error);
      return done(error, null);
    }
  }
));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:5001/api/auth/github/callback',
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Get email from GitHub
      const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
      console.log('📧 GitHub email:', email);
      
      // Check if user exists
      let user = await User.findOne({ email });
      
      if (!user) {
        // Create new user
        user = await User.create({
          name: profile.displayName || profile.username,
          email: email,
          githubId: profile.id,
          avatar: profile.photos[0]?.value,
          role: 'SDR',
          company: '',
          isActive: true,
          isEmailVerified: true
        });
        console.log('✅ New user created via GitHub');
      } else if (!user.githubId) {
        // Link GitHub account to existing user
        user.githubId = profile.id;
        await user.save();
        console.log('✅ GitHub account linked to existing user');
      }
      
      return done(null, { user });
    } catch (error) {
      console.error('❌ GitHub strategy error:', error);
      return done(error, null);
    }
  }
));

export default passport;