"use client";

import { useState } from "react";
import { LuMapPin } from "react-icons/lu";

const COUNTRIES: Record<string, string> = {
    us: "United States",
    br: "Brazil",
};

export function LocationPicker({
    country,
}: {
    country: string;
}): React.JSX.Element {
    //const [appear, setAppear] = useState<boolean>(false);
    //const [minicipality, setMinicipality] = useState<string>("");
    //const [administrativeDivision, setAdministrativeDivision] = useState<string>("");

    return (
        <button
            className="card card-xs border border-transparent transition-all duration-100 ease-in-out hover:bg-base-content/10 hover:border-base-200/50 hover:shadow-sm hover:cursor-pointer"
            onClick={() => console.log("location clicked!")}
        >
            <div className="card-body text-start">
                <h3 className="text-mist-500">Pick a location</h3>
                <div className="flex items-center text-lg gap-1">
                    <LuMapPin />
                    {COUNTRIES[country]}
                </div>
            </div>
        </button>
    );
}
