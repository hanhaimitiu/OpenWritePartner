import * as vscode from 'vscode';
import fetch from 'node-fetch';

interface Config {
  apiUrl: string;
  apiKey: string;
  model: string;
  polishPrompt: string;
  reviewPrompt: string;
  rewritePrompt: string;
}

let config: Config = {
  apiUrl: 'http://localhost:8080/v1/chat/completions',
  apiKey: '123',
  model: 'gpt-3.5-turbo',
  polishPrompt: '你是一位专业的文学编辑和作家。请对用户提供的小说文本进行润色优化，包括：\n1. 增强语言表达，让文字更生动优美\n2. 优化句子结构，提升可读性\n3. 丰富细节描写，增强画面感\n4. 保持原有的故事脉络和人物性格\n5. 优化对话，让人物更鲜活\n请只返回润色后的文本，不要添加额外的解释说明。',
  reviewPrompt: '你是一位专业的文学编辑。请对用户提供的小说文本进行全面审查，并提供详细的修改建议：\n\n1. **情节结构**：分析故事的起承转合，指出节奏问题和逻辑漏洞\n2. **人物塑造**：评价人物形象是否丰满，性格是否前后一致\n3. **语言表达**：指出用词不当、语法错误、重复冗余等问题\n4. **对话设计**：评价对话是否符合人物性格，是否自然流畅\n5. **场景描写**：评价场景描写是否生动，是否有画面感\n6. **建议修改**：针对发现的问题，提供具体的修改建议\n\n请用清晰的格式输出审查结果，便于作者理解和修改。',
  rewritePrompt: '你是一位专业的文学编辑和作家。请根据用户的要求对提供的文本进行改写。用户要求：{instruction}\n\n请只返回改写后的文本，不要添加额外的解释说明。',
};

export const aiService = {
  configure(): void {
    const extensionConfig = vscode.workspace.getConfiguration('openWritePartner');
    config.apiUrl = extensionConfig.get<string>('apiUrl', 'http://localhost:8080');
    config.apiKey = extensionConfig.get<string>('apiKey', '123');
    config.model = extensionConfig.get<string>('model', 'gpt-3.5-turbo');
    config.polishPrompt = extensionConfig.get<string>('polishPrompt', config.polishPrompt);
    config.reviewPrompt = extensionConfig.get<string>('reviewPrompt', config.reviewPrompt);
    config.rewritePrompt = extensionConfig.get<string>('rewritePrompt', config.rewritePrompt);
  },

  async sendRequest(prompt: string, systemPrompt: string): Promise<string> {
    try {
      const response = await fetch(config.apiUrl, {
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

  async polishNovelWithPrompt(text: string, prompt: string): Promise<string> {
    return this.sendRequest(text, prompt);
  },

  async reviewNovel(text: string): Promise<string> {
    return this.sendRequest(text, config.reviewPrompt);
  },

  async reviewNovelWithPrompt(text: string, prompt: string): Promise<string> {
    return this.sendRequest(text, prompt);
  },

  async rewriteNovel(text: string, instruction: string): Promise<string> {
    const systemPrompt = config.rewritePrompt.replace('{instruction}', instruction);
    return this.sendRequest(text, systemPrompt);
  },

  async rewriteNovelWithPrompt(text: string, prompt: string): Promise<string> {
    return this.sendRequest(text, prompt);
  }
};
