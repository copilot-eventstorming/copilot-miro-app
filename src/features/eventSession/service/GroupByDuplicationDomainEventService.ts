import {OpenAIClient, AzureKeyCredential} from '@azure/openai';
import {CompletionCreateParamsNonStreaming} from 'openai/resources';
import {sleep} from "openai/core";
import {Completions} from "@azure/openai/types/openai";
import {WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";
import {cleanHtmlTag} from "../../../application/service/utils/utils";
import {contentWithoutSpace} from "../../../utils/WorkshopCardUtils";

export type DynamicObject = {
    [key: string]: string[];
};

export type SimilarityGroup = {
    groupName: string;
    groupMembers: WorkshopCard[];
}

export class GroupByDuplicationDomainEventService {
// 设置你的 OpenAI API 密钥
    private apiKey: string = 'API KEY';
    private openai = new OpenAIClient(
        "https://copilot-gpt-instance.openai.azure.com/", new AzureKeyCredential(this.apiKey));
    private deploymentId = "copilot-gpt-35-turbo-instruct"
// 创建 OpenAI 客户端实例

// 定义函数进行 OpenAI API 调用
    private async openaiApiCall(cards: string[]): Promise<string> {
        // 构建输入文本
        const inputText = cards.join('\n');
        console.log(inputText)
        const result: Completions = await this.openai.getCompletions(this.deploymentId, [PromptPrefix + inputText], {
            maxTokens: 1000,
            temperature: 0.3
        });
        console.log(result.usage)
        for (const choice of result.choices) {
            console.log(choice.text);
        }
        // 返回生成的文本
        return result.choices[0].text.trim();
    }

    async perform(cards: WorkshopCard[]): Promise<SimilarityGroup[]> {
        console.log(cards.map(card => card.content))
        return this.openaiApiCall(cards.map(card => cleanHtmlTag(card.content)))
            .then(result => {
                console.log(result);
                return JSON.parse(result)
            })
            .catch(error => {
                console.error(error);
                return Promise.resolve(JSON.parse(responseExample))
            }).then((result: DynamicObject) =>
                Object.keys(result).map(key => {
                    const groupName = key
                    const groupMemberNames = result[groupName];
                    const groupMembers = cards
                        .filter(card => groupMemberNames.map(contentWithoutSpace)
                            .includes(contentWithoutSpace(card.content)));
                    return {groupName, groupMembers};
                })
            )
    }
}

const PromptPrefix = `Domain Event Duplication Detection: Cluster the following domain event candidates into groups by the similarity of their meaning, if you think they are duplicated events, then group them together, naming the cluster with any event candidate in the group, response should ONLY and STRICTLY follow the format below:
{
   "domainEventCandidateName1" : [domainEventCandidateName1, domainEventCandidateName2, domainEventCandidateName3],
   "domainEventCandidateNameA" : [domainEventCandidateNameA, domainEventCandidateNameB, domainEventCandidateNameC],
}
Input Event Names List as following:`

const responseExample = `{
   "Workshop Concepts Introduced": ["Workshop Concepts Introduced", "工作坊概念介绍", "工作坊理念呈现", "工作坊思想展示", "工作坊观念说明"],
   "Domain Event Storming Started": ["Domain Event Storming Started", "领域事件风暴开始", "领域事件激发启动", "领域事件爆发开启", "领域事件创造启动", "领域事件涌现开始"],
   "Agenda Introduced": ["Agenda Introduced", "议程介绍", "议程说明", "议程呈现", "议程展示", "议程演示"],
   "Workshop Concepts Aligned": ["Workshop Concepts Aligned", "工作坊概念对齐", "工作坊理念协调", "工作坊思想统一", "工作坊观念协同", "工作坊方案整合"],
   "Domain Event Candidate Created": ["Domain Event Candidate Created", "领域事件候选创建", "领域事件候选生成", "领域事件候选建立", "领域事件候选形成", "领域事件候选产生"],
   "Domain Event Candidate Corrected": ["Domain Event Candidate Corrected", "领域事件候选纠正", "领域事件候选修正", "领域事件候选修改", "领域事件候选改正", "领域事件候选调整"],
   "Domain Event Storming Completed": ["Domain Event Storming Completed", "领域事件风暴完成", "领域事件风暴结束", "领域事件风暴完结", "领域事件风暴终止", "领域事件风暴达成"],
   "Hotspots Created": ["Hotspots Created", "热点创建", "热点生成", "热点建立", "热点形成", "热点产生"],
   "Domain Event Explanation Started": ["Domain Event Explanation Started", "领域事件解释开始", "领域事件解释启动", "领域事件解释开启", "领域事件解释启动", "领域事件解释发起"],
   "Hotspots Resolved": ["Hotspots Resolved", "热点解决", "热点处理", "热点消除", "热点清除", "热点消解"],
   "Domain Event Candidate Deduplicated": ["Domain Event Candidate Deduplicated", "领域事件候选去重", "领域事件候选消重", "领域事件候选排重", "领域事件候选剔重", "领域事件候选除重"],
   "Domain Event Candidate Explained": ["Domain Event Candidate Explained", "领域事件候选解释", "领域事件候选说明", "领域事件候选阐释", "领域事件候选讲解", "领域事件候选解析"],
   "Domain Event Candidate Renamed": ["Domain Event Candidate Renamed", "领域事件候选重命名", "领域事件候选改名", "领域事件候选更名", "领域事件候选换名", "领域事件候选改称"],
   "Domain Event Candidate Accepted": ["Domain Event Candidate Accepted", "领域事件候选接受", "领域事件候选采纳", "领域事件候选认可", "领域事件候选通过", "领域事件候选同意"],
   "Domain Event Candidate Removed": ["Domain Event Candidate Removed", "领域事件候选移除", "领域事件候选删除", "领域事件候选清除", "领域事件候选去除", "领域事件候选撤销"],
   "Domain Events Aligned": ["Domain Events Aligned", "领域事件对齐", "领域事件协调", "领域事件统一", "领域事件协同", "领域事件整合"],
   "Domain Events Normalized": ["Domain Events Normalized", "领域事件规范化", "领域事件标准化", "领域事件正规化", "领域事件常态化", "领域事件规格化"],
   "Domain Events Optimized": ["Domain Events Optimized", "领域事件优化", "领域事件改进", "领域事件提升", "领域事件增强", "领域事件完善"],
   "Domain Events Backup": ["Domain Events Backup", "领域事件备份", "领域事件备用", "领域事件存档", "领域事件复制", "领域事件保存"],
   "Command Storming Prepared": ["Command Storming Prepared", "命令风暴准备", "命令风暴预备", "命令风暴准备", "命令风暴预设", "命令风暴预置"]
}
`