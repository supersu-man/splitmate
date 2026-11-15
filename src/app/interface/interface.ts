export const GROUP_THUMBNAILS = [
    "thumbnail_1.jpg",
    "thumbnail_2.jpg",
    "thumbnail_3.jpg",
    "thumbnail_4.jpg",
    "thumbnail_5.jpg",
    "thumbnail_6.jpg"
] as const;

export interface Group {
    id: string
    name: string
    thumbnail: string
    members: Member[]
    expenses: Expense[]
}

export interface Member {
    id: string
    name: string
}

export interface Expense {
    id: string
    amount: number
    description: string
    paidBy: string,
    date: Date,
    shares: { id: string, amount: number, share: number, fixed: boolean }[]
}

export interface Settlement {
    from: string
    to: string
    amount: number
}