const MockTest = require('../models/MockTest');

// @desc    Accept raw text input, parse, convert to JSON and save to MockTests
// @route   POST /api/quiz/paste
// @access  Public / Admin
const pasteQuizText = async (req, res) => {
    try {
        const { text, title, duration } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'No text provided' });
        }

        // 🧠 PARSING LOGIC exactly as requested
        const rawQuestions = text.split(/Q\d+\./).filter(Boolean);
        const parsedQuestions = [];

        for (let i = 0; i < rawQuestions.length; i++) {
            const rawQ = rawQuestions[i].trim();
            if (!rawQ) continue;

            const lines = rawQ.split('\n').map(line => line.trim()).filter(Boolean);
            
            // Extract:
            // First line → question
            // Next 4 lines → options (A, B, C, D)
            // Last line → answer
            if (lines.length < 6) {
                return res.status(400).json({ 
                    message: `Invalid format in question ${i + 1}. Ensure 1 question line, 4 option lines, and 1 answer line.` 
                });
            }

            const questionText = lines[0];
            const options = lines.slice(1, 5).map(opt => opt.replace(/^[A-Z]\.\s*/, '').trim()); // Strip A. B. C. D. prefixes
            const rawAnswerLine = lines[lines.length - 1]; // "Answer: C"
            
            const match = rawAnswerLine.match(/Answer:\s*([A-Z])/i);
            if (!match) {
                return res.status(400).json({ 
                    message: `Invalid answer format in question ${i + 1}. Example: "Answer: C"` 
                });
            }

            const correctAnswer = match[1].toUpperCase();

            parsedQuestions.push({
                questionText,
                options,
                correctAnswer
            });
        }

        if (parsedQuestions.length === 0) {
            return res.status(400).json({ message: 'No valid questions could be parsed from the text.' });
        }

        // Convert into mapped array for frontend and backend persistence
        const mockTest = new MockTest({
            title: title || 'Pasted MCQ Quiz',
            type: 'Quiz',
            questions: parsedQuestions,
            duration: duration || 30
        });

        const createdTest = await mockTest.save();

        res.status(201).json({
            message: 'Quiz created successfully',
            quiz: createdTest,
            // Returning the parsed format requested by frontend
            rawParsed: parsedQuestions.map(q => ({
                question: q.questionText,
                options: q.options,
                answer: q.correctAnswer
            }))
        });

    } catch (error) {
        console.error('Quiz Paste Error:', error);
        res.status(500).json({ message: 'Server Error during parsing or saving to MongoDB' });
    }
};

module.exports = {
    pasteQuizText
};
