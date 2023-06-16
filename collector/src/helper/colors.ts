
const colors =[
    {
        "id": 1,
        "string": "🔵"
    },
    {
        "id": 2,
        "string": "🔴"
    },
    {
        "id": 3,
        "string": "🟢"
    },
    {
        "id": 4,
        "string": "🟡"
    },
    {
        "id": 5,
        "string": "🌐"
    },
    {
        "id": 6,
        "string": "🟣"
    },
    {
        "id": 7,
        "string": "⚪"
    },
    {
        "id": 8,
        "string": "🟠"
    }
];

export function getColor(id: number) {
    return colors.find(x => x.id === id).string;
}
