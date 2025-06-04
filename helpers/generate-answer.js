const { ChatOpenAI } = require('@langchain/openai');

// https://js.langchain.com/v0.2/docs/integrations/chat/openai/
// https://js.langchain.com/v0.2/docs/integrations/chat/azure/
async function generateAnswer(query, retrievedChunks) {
    const llm = new ChatOpenAI({
        model: 'gpt-3.5-turbo',
        max_tokens: 500,
        temperature: 0.2,
    });

    const context = retrievedChunks.map(chunk => `**[${chunk.id}]:** ${chunk.text} `).join('\n\n');

    console.log(context);

    // const systemMessage = `
    //     Bạn là LMSBot, trợ lý điện tử của hệ thống quản lý học tập LMS.
    //     Nhiệm vụ của bạn là hỗ trợ giảng viên và học sinh trong việc giải thích nội dung tài liệu,
    //     trả lời mọi câu hỏi bằng tiếng Việt, sử dụng ngôn ngữ ngắn gọn, chính xác và dễ hiểu.
    //     Trả lời dựa trên thông tin có trong nội dung được cung cấp, nếu không tìm thấy trong nội dung được cung cấp bạn có thể tự tìm hiểu và trả lời.
    //     Nếu không có thông tin phù hợp, hãy trả lời:
    //     "Không tìm thấy thông tin phù hợp trong tài liệu được cung cấp."`;
    const systemMessage = `
        Bạn là Learn Smart, trợ lý điện tử của hệ thống quản lý học tập LMS.  
        Nhiệm vụ của bạn là hỗ trợ giảng viên và học sinh trong việc giải thích nội dung tài liệu,  
        trả lời mọi câu hỏi bằng tiếng Việt, sử dụng ngôn ngữ ngắn gọn, chính xác và dễ hiểu.  
        Khi có nội dung được cung cấp, hãy ưu tiên sử dụng thông tin trong nội dung đó để trả lời.  
        Nếu thông tin không có trong nội dung được cung cấp, bạn có thể sử dụng hiểu biết của mình để đưa ra câu trả lời phù hợp.
        `;

    const humanMessage = `
        Dưới đây là phần trích dẫn tài liệu học tập hoặc hướng dẫn:
        "${context}"

        Câu hỏi của người dùng: "${query}"

        Dựa trên nội dung trên, hãy đưa ra câu trả lời chính xác, ngắn gọn và dễ hiểu, phù hợp với đối tượng là giảng viên hoặc học sinh.`;

    // Invoke the LLM with the system and human messages
    const aiMsg = await llm.invoke([
        ['system', systemMessage],
        ['human', humanMessage],
    ]);

    // Extract the answer from the model's response
    const answer = aiMsg.content.trim();

    return {
        answer,
        sources: retrievedChunks,
    };
}

//const finalAnswer = await generateAnswer(relevantChunks);
module.exports = {
    generateAnswer,
};
