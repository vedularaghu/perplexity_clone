import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import { performance } from 'perf_hooks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

global.performance = performance;

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());

async function getSearchResults(query) {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${process.env.SERP_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch search results: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

async function fetchAIResponse(query, context) {
    const openAiKey = process.env.OPENAI_API_KEY;
    const url = "https://api.openai.com/v1/chat/completions";

    const contextLimit = 2500;
    if (context.length > contextLimit) {
        console.log(`Context too long (${context.length} characters), truncating...`);
        context = context.slice(0, contextLimit);
    }

    const body = {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a search engine." },
            { role: "user", content: `${query}\n\nContext:\n${context}` },
        ],
        max_tokens: 200,
        temperature: 0.7,
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to fetch AI response: ${response.statusText}. Details: ${errorBody}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

async function getFollowUpQuestions(query) {
    const openAiKey = process.env.OPENAI_API_KEY;
    const url = "https://api.openai.com/v1/chat/completions";

    const body = {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a search engine which asks follow-up questions to a query." },
            { role: "user", content: `Generate 5 follow-up questions for: ${query} and make sure the query word exists in the question` },
        ],
        max_tokens: 100,
        temperature: 0.7,
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`${response.statusText}${errorBody}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.split('\n').filter(q => q.trim());
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/query', async(req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Ask something' });
        }

        const searchResults = await getSearchResults(query);
        const context = searchResults.organic_results
            .map(result => `${result.title}: ${result.snippet}`)
            .join('\n');

        const aiResponse = await fetchAIResponse(query, context);
        const followUpQuestions = await getFollowUpQuestions(query);

        res.json({
            query,
            searchResults: searchResults.organic_results,
            aiResponse,
            followUpQuestions,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/followup', async(req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: 'Question required' });
        }

        const searchResults = await getSearchResults(question);
        const context = searchResults.organic_results
            .map(result => `${result.title}: ${result.snippet}`)
            .join('\n');

        const aiResponse = await fetchAIResponse(question, context);
        const followUpQuestions = await getFollowUpQuestions(question);

        res.json({
            question,
            searchResults: searchResults.organic_results,
            aiResponse,
            followUpQuestions,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});