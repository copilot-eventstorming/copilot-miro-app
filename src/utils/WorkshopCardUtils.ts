import {cleanHtmlTag} from "../application/service/utils/utils";

export function contentWithoutSpace(content: string): string {
    return cleanHtmlTag(content).replace(/\s/g, '');
}

export function contentEquals(oneContent: string, otherContent: string): boolean {
    return contentWithoutSpace(oneContent) === contentWithoutSpace(otherContent)
}