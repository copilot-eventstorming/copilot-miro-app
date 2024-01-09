import OpenAI from 'openai';
import {CompletionCreateParamsNonStreaming} from 'openai/resources';

export type TValidDomainEventCandidate = {
    name: string;
    comments: string;
}

export type TInvalidDomainEventCandidate = {
    name: string;
    reason: string;
    fix: {
        action: 'drop' | 'rename';
        name?: string;
    }
}

export type TValidateDomainEventResponse = {
    validDomainEvents: TValidDomainEventCandidate[];
    invalidDomainEvents: TInvalidDomainEventCandidate[];
}

export class ValidateDomainEventService {
// 设置你的 OpenAI API 密钥
    private apiKey: string = 'API_KEY';

// 创建 OpenAI 客户端实例
    private openai: OpenAI = new OpenAI({apiKey: this.apiKey, dangerouslyAllowBrowser:true});

// 定义函数进行 OpenAI API 调用
    private async openaiApiCall(cards: string[]): Promise<string> {
        // 构建输入文本
        const inputText = cards.join('\n');

        // 调用 OpenAI API
        const response = await this.openai.completions.create({
            model: 'gpt-3.5-turbo-instruct', // 使用合适的引擎
            prompt: PromptPrefix + inputText,
            max_tokens: 150, // 设置生成文本的最大长度
            n: 1, // 设置生成的样本数量
            stop: null, // 设置停用词，如果有的话
            stream: false, // 设置为 true 以流式传输响应
        } as CompletionCreateParamsNonStreaming);

        // 返回生成的文本
        return response.choices[0].text.trim();
    }

    async perform(cards: string[]): Promise<TValidateDomainEventResponse> {
        this.openaiApiCall(cards)
            .then(result => console.log(result))
            .catch(error => console.error(error));

        return Promise.resolve(JSON.parse(responseExample));
    }
}

const PromptPrefix = `From event storming workshop training perspective, event storming in event storming, which of the following are not likely domain events of the workshop, response should ONLY follow the format below:
{ 
    "validDomainEvents": [
       { 
          "name": "Domain Event Candidate Renamed" , 
          "comments" : " Indicates a change in the naming of an event during the workshop process."
       }
     ], 
     
     "invalidDomainEvents" : [ 
       {
        "name" : "Domain Event Candidate Explained", 
        "reason" : " Represents an action related to explaining or discussing a candidate event.",
        "fix" : {
          "action" : "drop"
        }
       },
       {
        "name" : "Domain Event Candidate Explained", 
        "reason" : " Represents an action related to explaining or discussing a candidate event.",
        "fix" : {
          "action" : "rename"
          "name" : "Domain Event Candidate Aligned"
        }
       },
     ]
}

The fix in the invalidDomainEvents part of response body, can have two options: { action: drop } or { action : rename, name: newName } 
Input Event Names List as following:
`

const responseExample = `{
  "validDomainEvents": [
    {
      "name": "Domain Event Candidate Renamed",
      "comments": "Indicates a change in the naming of an event during the workshop process."
    },
    {
      "name": "Hotspots Resolved",
      "comments": "Represents the resolution of hotspots, indicating a significant action in the domain."
    },
    {
      "name": "Hotspots Created",
      "comments": "Indicates the creation of hotspots, reflecting a change or discovery in the domain."
    },
    {
      "name": "Domain Events Aligned",
      "comments": "Represents the alignment of domain events, a significant step in understanding the domain."
    },
    {
      "name": "Domain Events Optimized",
      "comments": "Indicates optimization of domain events, reflecting refinement in the understanding of the domain."
    },
    {
      "name": "Domain Events Normalized",
      "comments": "Represents the normalization of domain events, suggesting a refined understanding of the domain."
    },
    {
      "name": "Domain Event Storming Completed",
      "comments": "Signifies the completion of the domain event storming process."
    },
    {
      "name": "Domain Event Candidate Created",
      "comments": "Indicates the creation of a new candidate domain event."
    }
  ],
  "invalidDomainEvents": [
    {
      "name": "Domain Event Candidate Explained",
      "reason": "Represents an action related to explaining or discussing a candidate event.",
      "fix": {
        "action": "rename",
        "name" : "Domain Event Candidate Aligned"
      }
    },
    {
      "name": "Domain Event Candidate Accepted",
      "reason": "Represents an action related to accepting a candidate event.",
      "fix": {
        "action": "drop"
      }
    },
    {
      "name": "Domain Event Candidate Removed",
      "reason": "Represents an action related to removing a candidate event.",
      "fix": {
        "action": "drop"
      }
    },
    {
      "name": "Domain Event Candidate Deduplicated",
      "reason": "Represents an action related to deduplicating candidate events.",
      "fix": {
        "action": "drop"
      }
    },
    {
      "name": "Domain Event Explanation Started",
      "reason": "Indicates the start of explaining domain events, more focused on the workshop process than the domain.",
      "fix": {
        "action": "drop"
      }
    },
    {
      "name": "Domain Events Backup",
      "reason": "Represents a backup of domain events, more related to the workshop process than the domain.",
      "fix": {
        "action": "drop"
      }
    },
    {
      "name": "Command Storming Prepared",
      "reason": "Indicates preparation for command storming, which is more related to the workshop process than the domain.",
      "fix": {
        "action": "drop"
      }
    },
    {
      "name": "Workshop Concepts Aligned",
      "reason": "Indicates the alignment of workshop concepts, which is more focused on the workshop process than the domain.",
      "fix": {
        "action": "drop"
      }
    },
    {
      "name": "Agenda Introduced",
      "reason": "Represents the introduction of an agenda, which is related to the workshop process rather than the domain.",
      "fix": {
        "action": "drop"
      }
    }
  ]
}
`