import express from 'express';
import { protect } from '../middleware/auth.js';
import Lead from '../models/Lead.js';
import Interaction from '../models/Interaction.js';

const router = express.Router();

// Mock data generator functions
const generateMockAnalysis = () => {
    const score = Math.floor(Math.random() * 40) + 60; // 60-100
    return {
        leadScore: score,
        buyingIntent: score >= 80 ? 'High' : score >= 65 ? 'Medium' : 'Low',
        talkingPoints: [
            'Discuss budget approval timeline',
            'Highlight ROI and cost savings potential',
            'Review industry-specific case studies',
            'Address integration and implementation concerns'
        ],
        suggestedAction: score >= 80 ? 'Schedule product demo within 48 hours' : 'Send personalized follow-up with case studies',
        riskLevel: score >= 75 ? 'Low' : score >= 60 ? 'Medium' : 'High',
        estimatedCloseTime: score >= 80 ? '2-3 weeks' : '4-6 weeks',
        recommendation: 'Focus on value proposition and quick wins to build momentum'
    };
};

const generateMockEmail = (data) => {
    const { leadName, company, product, tone, senderName } = data;
    return {
        subject: `Helping ${company || 'your company'} achieve more with ${product || 'our platform'}`,
        body: `Hi ${leadName || 'there'},\n\nI hope this message finds you well. My name is ${senderName || 'Alex'}, and I help sales teams at companies like ${company || 'yours'} streamline their processes and close deals faster.\n\nI noticed that ${company || 'your team'} might benefit from our AI-powered platform. We've helped similar companies in your industry increase their conversion rates by an average of 45%.\n\nWould you be open to a 15-minute call next week to explore if this could be valuable for ${company || 'your team'}?\n\nBest regards,\n${senderName || 'Alex'}\nSales Development Rep`,
        followUp: `Hi ${leadName || 'there'},\n\nJust following up on my previous message. Many teams similar to ${company || 'yours'} have seen immediate results in their first 30 days.\n\nWould a quick 10-minute chat work for you this week?\n\nBest,\n${senderName || 'Alex'}`
    };
};

const generateMockSummary = () => {
    const healthOptions = ['Positive', 'Neutral', 'Negative'];
    const randomHealth = healthOptions[Math.floor(Math.random() * healthOptions.length)];
    
    return {
        overview: 'The meeting was productive. Key requirements were discussed, and the prospect showed strong interest in the platform\'s capabilities. Budget and timeline were the main topics of discussion.',
        keyConcerns: [
            'Integration timeline with existing systems',
            'Internal stakeholder approval process',
            'Budget allocation for Q3',
            'Competitive offerings in the market'
        ],
        positiveSignals: [
            'Decision maker was engaged throughout',
            'Specific use cases were identified',
            'Budget appears to be available',
            'Interest in AI-powered features'
        ],
        nextAction: 'Send detailed proposal with technical specifications and arrange follow-up with IT team',
        dealHealth: randomHealth
    };
};

const generateMockRiskAnalysis = (lead) => {
    const riskLevels = ['Low', 'Medium', 'High'];
    const randomRisk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const riskScore = randomRisk === 'Low' ? Math.floor(Math.random() * 30) + 20 :
                     randomRisk === 'Medium' ? Math.floor(Math.random() * 30) + 50 :
                     Math.floor(Math.random() * 20) + 80;
    
    return {
        riskLevel: randomRisk,
        riskScore: riskScore,
        factors: [
            {
                type: 'Engagement',
                status: riskScore < 50 ? 'Healthy' : riskScore < 75 ? 'Warning' : 'Danger',
                label: `Last contact was ${Math.floor(Math.random() * 14) + 1} days ago`,
                impact: riskScore < 50 ? 'Low' : riskScore < 75 ? 'Medium' : 'High',
                trend: Math.random() > 0.5 ? 'improving' : 'declining'
            },
            {
                type: 'Budget',
                status: Math.random() > 0.6 ? 'Healthy' : Math.random() > 0.3 ? 'Warning' : 'Danger',
                label: 'Budget approval process in progress',
                impact: 'High',
                trend: Math.random() > 0.5 ? 'improving' : 'stable'
            },
            {
                type: 'Competition',
                status: Math.random() > 0.7 ? 'Healthy' : Math.random() > 0.4 ? 'Warning' : 'Danger',
                label: 'Competitor mentioned in recent conversations',
                impact: 'Medium',
                trend: 'declining'
            }
        ],
        recommendations: [
            'Schedule executive briefing with decision makers',
            'Provide competitive comparison matrix',
            'Offer extended pilot program',
            'Engage with champion to strengthen internal support'
        ],
        probability: Math.floor(Math.random() * 40) + 40,
        velocity: Math.random() > 0.6 ? 'fast' : Math.random() > 0.3 ? 'normal' : 'slow',
        timeline: {
            expectedClose: new Date(Date.now() + (Math.random() * 60 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            daysInStage: Math.floor(Math.random() * 30) + 5,
            velocity: Math.random() > 0.6 ? 'fast' : Math.random() > 0.3 ? 'normal' : 'slow'
        }
    };
};

const generateMockProposal = (lead, focusPoints) => {
    const today = new Date();
    const validUntil = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0];
    
    return {
        title: `${lead?.company || 'Your Company'} - AI-Powered Sales Intelligence Platform`,
        executiveSummary: `This proposal outlines how SalesMind AI can help ${lead?.company || 'your company'} transform their sales process with artificial intelligence. Our platform has helped similar companies increase conversion rates by 45% and reduce sales cycles by 30%. Based on our discussions, we believe there's significant opportunity for ${lead?.company || 'your company'} to leverage AI for lead scoring, email automation, and deal risk prediction.`,
        sections: [
            {
                title: 'Our Solution',
                content: 'SalesMind AI is a comprehensive sales intelligence platform that uses machine learning to analyze leads, predict deal outcomes, and automate routine tasks. Key features include AI-powered lead scoring, personalized email generation, meeting summarization, and deal risk prediction.'
            },
            {
                title: 'Implementation Plan',
                content: 'Our standard implementation takes 2-3 weeks and includes data migration, team training, and integration with your existing CRM. We provide dedicated support throughout the process to ensure a smooth transition.'
            },
            {
                title: 'ROI Analysis',
                content: `Based on your team size and deal volume, we project a 3x ROI within the first year. This includes time savings from automation (estimated 10 hours/week per rep), increased conversion rates (projected 45% improvement), and reduced customer churn through better risk prediction.`
            }
        ],
        pricing: `Annual Enterprise License: $48,000\nImplementation & Onboarding: Included\nPriority 24/7 Support: Included\n\nOptional: Custom integrations and API access available at additional cost.`,
        nextSteps: '1. Review and sign the agreement\n2. Schedule kickoff meeting\n3. Begin data migration\n4. Team training sessions\n5. Go live within 3 weeks',
        validUntil: validUntil
    };
};

// Mock chat response generator
const generateMockChatResponse = (messages, context) => {
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    
    // Check if user wants to analyze the best deal
    if (lastMessage.includes('best deal') || lastMessage.includes('top deal') || lastMessage.includes('best lead')) {
        const bestLead = context.leads.sort((a, b) => (b.value || 0) - (a.value || 0))[0];
        if (bestLead) {
            return {
                message: `🔍 **Analysis for ${bestLead.name}**\n\n` +
                        `• **Company**: ${bestLead.company}\n` +
                        `• **Industry**: ${bestLead.industry || 'N/A'}\n` +
                        `• **Deal Value**: $${(bestLead.value || 0).toLocaleString()}\n` +
                        `• **Current Stage**: ${bestLead.status}\n` +
                        `• **Lead Score**: ${bestLead.leadScore || 0}\n` +
                        `• **Win Probability**: **${bestLead.leadScore || 50}%**\n\n` +
                        `**Recommendations:**\n` +
                        `1. Schedule a demo within the next 48 hours\n` +
                        `2. Prepare a customized proposal highlighting ROI\n` +
                        `3. Connect them with your technical team for questions\n\n` +
                        `Would you like me to draft a follow-up email for this lead?`,
                suggestions: [
                    `Draft email to ${bestLead.name}`,
                    `Create task for ${bestLead.name}`,
                    `Show similar deals`
                ],
                actions: [
                    { label: `Email ${bestLead.name}`, type: 'email', data: bestLead },
                    { label: `Create Task`, type: 'task', data: bestLead }
                ]
            };
        }
    }
    
    // Check if user is asking to analyze a specific lead
    const mentionedLead = context.leads.find(l => 
        lastMessage.includes(l.name.toLowerCase()) || 
        lastMessage.includes(`analyze ${l.name.toLowerCase()}`) || 
        lastMessage.includes(`tell me about ${l.name.toLowerCase()}`)
    );
    
    if (mentionedLead) {
        return {
            message: `🔍 **Analysis for ${mentionedLead.name}**\n\n` +
                    `• **Company**: ${mentionedLead.company}\n` +
                    `• **Industry**: ${mentionedLead.industry || 'N/A'}\n` +
                    `• **Deal Value**: $${(mentionedLead.value || 0).toLocaleString()}\n` +
                    `• **Current Stage**: ${mentionedLead.status}\n` +
                    `• **Lead Score**: ${mentionedLead.leadScore || 0}\n` +
                    `• **Win Probability**: **${mentionedLead.leadScore || 50}%**\n\n` +
                    `Based on this data, I recommend focusing on moving this deal to the next stage. Would you like me to draft a follow-up email?`,
            suggestions: [
                `Draft email to ${mentionedLead.name}`,
                `Create task for ${mentionedLead.name}`,
                `Show similar deals`
            ],
            actions: [
                { label: `Email ${mentionedLead.name}`, type: 'email', data: mentionedLead },
                { label: `Create Task`, type: 'task', data: mentionedLead }
            ]
        };
    }
    
    // Pipeline analysis
    if (lastMessage.includes('pipeline') || lastMessage.includes('overview')) {
        const totalValue = context.leads.reduce((sum, l) => sum + (l.value || 0), 0);
        const sortedLeads = [...context.leads].sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 3);
        
        return {
            message: `📈 **Pipeline Analysis**\n\n` +
                    `Your pipeline currently has **${context.leads.length} deals** worth **$${totalValue.toLocaleString()}**.\n\n` +
                    `**Top Opportunities:**\n` +
                    `${sortedLeads.map((l, i) => `${i+1}. **${l.name}** (${l.company}) - $${(l.value || 0).toLocaleString()} | Win Probability: **${l.leadScore || 50}%**`).join('\n')}\n\n` +
                    `Would you like me to analyze any specific deal in detail?`,
            suggestions: [
                `Analyze best deal`,
                `Show at-risk deals`,
                `Draft follow-up emails`
            ],
            actions: []
        };
    }
    
    // At-risk deals
    if (lastMessage.includes('risk') || lastMessage.includes('at-risk')) {
        const atRiskLeads = context.leads.filter(l => (l.leadScore || 50) < 40).slice(0, 3);
        if (atRiskLeads.length === 0) {
            return {
                message: 'Good news! I don\'t see any high-risk deals in your pipeline right now.',
                suggestions: ['Show me my best deals', 'Analyze pipeline health'],
                actions: []
            };
        }
        
        return {
            message: `⚠️ **Deals That Need Attention**\n\n` +
                    `The following deals have a low win probability and may need attention:\n\n` +
                    `${atRiskLeads.map((l, i) => `• **${l.name}** (${l.company}) - $${(l.value || 0).toLocaleString()} | Win Probability: **${l.leadScore || 50}%**`).join('\n')}\n\n` +
                    `Would you like me to suggest next steps for these deals?`,
            suggestions: [
                `Suggest next steps`,
                `Draft follow-up email`,
                `Schedule review meeting`
            ],
            actions: atRiskLeads.map(l => ({
                label: `View ${l.name}`,
                type: 'lead',
                data: l
            }))
        };
    }
    
    // Email drafting
    if (lastMessage.includes('email') || lastMessage.includes('draft')) {
        return {
            message: 'I can help you draft emails for your leads. Which lead would you like to contact?',
            suggestions: ['Email top lead', 'Draft follow-up', 'Create sequence'],
            actions: context.leads.slice(0, 3).map(l => ({
                label: `Email ${l.name}`,
                type: 'email',
                data: l
            }))
        };
    }
    
    // Default response
    return {
        message: 'I understand you need assistance. Here\'s what I can help you with:\n\n' +
                 '• 📊 **Pipeline Analysis** - Get insights on your deals\n' +
                 '• 🎯 **Lead Analysis** - Deep dive into specific leads\n' +
                 '• 📧 **Email Drafting** - Create personalized outreach emails\n' +
                 '• ⚠️ **Risk Detection** - Identify at-risk deals\n' +
                 '• 📈 **Win Probability** - Predict deal success\n\n' +
                 'What would you like me to help with?',
        suggestions: [
            'Analyze my pipeline',
            'Show high-value deals',
            'Identify at-risk deals',
            'Draft an email'
        ],
        actions: []
    };
};

// Apply authentication to all routes
router.use(protect);

// @route   POST /api/ai/chat
// @desc    AI chat with CRM context
// @access  Private
router.post('/chat', protect, async (req, res) => {
    try {
        const { messages, context } = req.body;

        // Generate mock chat response
        const response = generateMockChatResponse(messages, context);

        res.json({ 
            success: true, 
            message: response.message,
            suggestions: response.suggestions,
            actions: response.actions 
        });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error processing chat request',
            error: error.message 
        });
    }
});

// @route   POST /api/ai/analyze-lead
router.post('/analyze-lead', async (req, res) => {
    try {
        const { leadId, industry, notes, company } = req.body;

        // Verify lead exists and belongs to user
        if (leadId) {
            const lead = await Lead.findOne({ _id: leadId, userId: req.user._id });
            if (!lead) {
                return res.status(404).json({ message: 'Lead not found' });
            }
        }

        // Generate mock analysis
        const analysis = generateMockAnalysis();

        // If leadId provided, update the lead with analysis
        if (leadId) {
            await Lead.findOneAndUpdate({ _id: leadId, userId: req.user._id }, {
                leadScore: analysis.leadScore,
                aiAnalysis: analysis
            });
        }

        res.json({ success: true, analysis });
    } catch (error) {
        console.error('AI Service Error:', error);
        res.status(500).json({ 
            message: 'Error generating AI response', 
            error: error.message 
        });
    }
});

// @route   POST /api/ai/generate-email
router.post('/generate-email', async (req, res) => {
    try {
        const { leadName, company, product, tone, industry, senderName, leadId } = req.body;

        // Validate required fields
        if (!leadName || !company) {
            return res.status(400).json({ 
                message: 'Lead name and company are required' 
            });
        }

        // Generate mock email
        const email = generateMockEmail({ leadName, company, product, tone, senderName });

        res.json({ success: true, email });
    } catch (error) {
        console.error('AI Service Error:', error);
        res.status(500).json({ message: 'Error generating email', error: error.message });
    }
});

// @route   POST /api/ai/summarize-meeting
router.post('/summarize-meeting', async (req, res) => {
    try {
        const { notes, leadName, company, leadId } = req.body;

        if (!notes || notes.trim().length < 50) {
            return res.status(400).json({ 
                message: 'Please provide detailed meeting notes (at least 50 characters)' 
            });
        }

        // Generate mock summary
        const summary = generateMockSummary();

        // If leadId provided, create an interaction record
        if (leadId) {
            await Interaction.create({
                leadId,
                userId: req.user._id,
                type: 'Meeting',
                notes: notes,
                aiSummary: summary.overview,
                sentiment: summary.dealHealth === 'Positive' ? 'Positive' : 
                          summary.dealHealth === 'Negative' ? 'Negative' : 'Neutral'
            });
        }

        res.json({ success: true, summary });
    } catch (error) {
        console.error('AI Service Error:', error);
        res.status(500).json({ message: 'Error summarizing meeting', error: error.message });
    }
});

// @route   POST /api/ai/deal-risk
router.post('/deal-risk', async (req, res) => {
    try {
        const { leadId } = req.body;

        if (!leadId) {
            return res.status(400).json({ message: 'Lead ID is required' });
        }

        // Get lead with all interactions
        const lead = await Lead.findOne({ _id: leadId, userId: req.user._id });
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Generate mock risk analysis
        const riskAnalysis = generateMockRiskAnalysis(lead);

        res.json({ success: true, riskAnalysis });
    } catch (error) {
        console.error('AI Service Error:', error);
        res.status(500).json({ message: 'Error analyzing deal risk', error: error.message });
    }
});

// @route   POST /api/ai/generate-proposal
router.post('/generate-proposal', async (req, res) => {
    try {
        const { leadId, template, focusPoints } = req.body;

        if (!leadId) {
            return res.status(400).json({ message: 'Lead ID is required' });
        }

        const lead = await Lead.findOne({ _id: leadId, userId: req.user._id });
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Generate mock proposal
        const proposal = generateMockProposal(lead, focusPoints);

        res.json({ success: true, proposal });
    } catch (error) {
        console.error('AI Service Error:', error);
        res.status(500).json({ message: 'Error generating proposal', error: error.message });
    }
});

export default router;