type Country = {
    name: string;
    iso2: string; //  Country code
    phonecode: string;
    currency_name: string;
    currency_symbol: string;
    native: string;
};

type State = {
    name: string;
    iso2: string; //  State code
};

type City = {
    name: string;
};

export const supported = [
    {
        iso2: "us",
        states: [{ name: "Wisconsin", cities: [{ name: "Madison" }] }],
    },
    {
        iso2: "br",
        states: [{ name: "Minas Gerais", cities: [{ name: "Divinópolis" }] }],
    },
];
