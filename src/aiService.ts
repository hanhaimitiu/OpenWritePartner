import * as vscode from 'vscode';
import fetch from 'node-fetch';

interface Config {
  apiUrl: string;
  apiKey: string;
  model: string;
  polishPrompt: string;
  continuePrompt: string;
}

let config: Config = {
  apiUrl: 'http://localhost:8080',
  apiKey: '123',
  model: 'gpt-3.5-turbo',
  polishPrompt: '你是一位专业的文学编辑和作家。请对用户提供的小说文本进行润色优化，包括：\n1. 增强语言表达，让文字更生动优美\n2. 优化句子结构，提升可读性\n3. 丰富细节描写，增强画面感\n4. 保持原有的故事脉络和人物性格\n5. 优化对话，让人物更鲜活\n请只返回润色后的文本，不要添加额外的解释说明。',
  continuePrompt: '你是一位富有想象力的小说家。请根据用户提供的小说片段，继续创作后续内容：\n1. 保持原有的风格和基调\n2. 延续故事的情节发展\n3. 保持人物性格和对话风格一致\n4. 让故事自然流畅地延续\n5. 可以适当增加悬念和冲突\n请只返回续写的内容，不要添加额外的解释说明。'
};

export const aiService = {
  configure(): void {
    const extensionConfig = vscode.workspace.getConfiguration('openWritePartner');
    config.apiUrl = extensionConfig.get<string>('apiUrl', 'http://localhost:8080');
    config.apiKey = extensionConfig.get<string>('apiKey', '123');
    config.model = extensionConfig.get<string>('model', 'gpt-3.5-turbo');
    config.polishPrompt = extensionConfig.get<string>('polishPrompt', config.polishPrompt);
    config.continuePrompt = extensionConfig.get<string>('continuePrompt', config.continuePrompt);
  },

  async sendRequest(prompt: string, systemPrompt: string): Promise<string> {
    try {
      const response = await fetch(`${config.apiUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API请求失败: ${response.status} ${errorText}`);
      }

      const data = await response.json() as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('AI服务请求错误:', error);
      throw error;
    }
  },

  async polishNovel(text: string): Promise<string> {
    return this.sendRequest(text, config.polishPrompt);
  },

  async continueNovel(text: string): Promise<string> {
    return this.sendRequest(text, config.continuePrompt);
  }
};
