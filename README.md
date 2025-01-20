# Perplexity Clone

A web application that combines search engine results with AI-generated responses, allowing users to explore topics with follow-up questions and dynamic content.

## Features

- **Search Integration**: Fetches search results using SerpAPI for any query.
- **AI Responses**: Provides detailed AI-generated answers to user queries using OpenAI's API.
- **Follow-Up Questions**: Suggests relevant follow-up questions based on the user's query.
- **Interactive Experience**: Users can click on follow-up questions to fetch new AI responses and search results dynamically.
- **Auto-Reload**: Supports automatic server restarts during development with `nodemon`.

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/perplexity-clone.git
   cd perplexity-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   SERP_API_KEY=your_serp_api_key
   PORT=8080
   ```

4. Start the application:
   - For production:
     ```bash
     npm start
     ```
   - For development with auto-reloading:
     ```bash
     npm run dev
     ```

5. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## Acknowledgments
- [OpenAI API](https://openai.com/)
- [SerpAPI](https://serpapi.com/)
