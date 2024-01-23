import {Coordinate, EdgeKey, Geometry, MatrixIndex, MatrixNode, NestedGroupNode} from "../../../domain/graph";
import {WorkshopCard} from "../../spi/WorkshopBoardSPI";
import {Connector} from "@mirohq/websdk-types";

export function calculateAverage(numbers: number[]): number {
    const max = Math.max(...numbers);
    const filteredNumbers = numbers.filter(num => num !== max);
    const sum = filteredNumbers.reduce((acc, cur) => acc + cur, 0);
    return sum / filteredNumbers.length;
}

export function convertConnectorToEdgeKey(edge: Connector): EdgeKey {
    let start = edge!.start;
    let end = edge!.end;
    if (edge.style.startStrokeCap === 'none' && edge.style.endStrokeCap === 'none') {
    } else if (edge.style.startStrokeCap !== 'none' && edge.style.endStrokeCap !== 'none') {
    } else if (edge.style.startStrokeCap !== 'none') {
        start = edge.end;
        end = edge.start;
    }
    let weight;
    if (edge.style.strokeStyle === 'normal') {
        weight = 1;
    } else if (edge.style.strokeStyle === 'dotted') {
        weight = 0.1;
    } else {// if (edge.style.strokeStyle == 'dashed') {
        weight = 0.5;
    }
    return new EdgeKey(start!.item, end!.item, weight);
}

export function convertToNodeObject(category: string, level: number, ignoredWhenSizing: boolean = false): (miroObject: WorkshopCard) => NestedGroupNode {
    return (miroObject) => {
        let x = miroObject.x;
        let y = miroObject.y;
        let width = miroObject.width;
        let height = miroObject.height;
        let shape = miroObject.shape;

        let name = '';
        if (miroObject.content && miroObject.content.length > 0) {
            name = miroObject.content.trim();
        }
        let r = new NestedGroupNode(new MatrixNode(miroObject.id, name, category,
            Geometry.fromSize(width, height, shape), Coordinate.from(x, y),
            MatrixIndex.from(0, 0), shape), [], level, ignoredWhenSizing);
        if (miroObject.style && miroObject.style.fillColor) {
            r.style = {fillColor: miroObject.style.fillColor};
        }
        return r;
    }
}

const htmlEntities: { [key: string]: string } = {
    '<[^>]*>?': ' ',
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&cent;': '￠',
    '&pound;': '£',
    '&yen;': '¥',
    '&euro;': '€',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&times;': '×',
    '&divide;': '÷',
    '&bull;': '•',
    '&hellip;': '…',
    '&#xff0c;': ',',
    '&#39;': "'",
    "\\s+": " ",
    "&#xff1f;":"?",
};

export function cleanHtmlTag(title: string | undefined): string {
    if (title === undefined) return '-';
    for (let entity in htmlEntities) {
        title = title!.replaceAll(new RegExp(entity, 'g'), htmlEntities[entity]);
    }
    return title
}
export function prettifyContent(card: WorkshopCard, content: string): WorkshopCard {
    const words = content.split(/\s+/);
    const chunks = words.map(word => {
        if (/[\u4e00-\u9fa5]/.test(word)) { // 如果是中文
            return word.match(/.{1,4}/g)?.join('</p><p>');
        } else { // 如果是英文
            return word.match(/\b\w+\b/g)?.join('</p><p>');
        }
    });
    card.content = "<p>" + chunks?.join(' ') + "</p>";
    return card;
}
export function sizeof(object: any): string {
    const str = JSON.stringify(object);
    const size = new Blob([str]).size;
    return (size / 1024).toFixed(2) + " KB";
}