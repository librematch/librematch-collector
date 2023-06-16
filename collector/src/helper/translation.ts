import en from '../../assets/translation/en.json';

export function getTranslation(language: string, category: string, key: number) {
    // console.log('getTranslation', language, category, key);
    // console.log('de', de);

    const item = en[category].find(x => x.id === key);

    if (item == null) {
        return `[${category}.${key}]`;
    }

    return item.string;

    // switch (language) {
    //     case 'de':
    //         return de[category].find(x => x.id === key).string;
    //     default:
    //         return de[category].find(x => x.id === key).string;
    // }
}
