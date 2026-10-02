export const COUNTRIES = {
    us: {
        name: "United States",
        currency: {
            symbol: "$",
            code: "USD",
        },
        administrativeDivisions: {
            ny: {
                name: "New York",
                municipalities: ["New York City"],
            },
            ca: {
                name: "California",
                municipalities: ["San Francisco"],
            },
        },
    },
    br: {
        name: "Brazil",
        currency: {
            symbol: "R$",
            code: "BRL",
        },
        administrativeDivisions: {
            sp: {
                name: "São Paulo",
                municipalities: ["São Paulo", "Taboão da Serra"],
            },
        },
    },
};
