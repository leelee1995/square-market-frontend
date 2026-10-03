"use client";

import { useRequiredAuth } from "@/hooks/useRequiredAuth";
import { getCsrfToken } from "@/lib/csrf";
import { env } from "@/lib/env";
import Image from "next/image";
import { redirect, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface Listing {
    images: string[];
    title: string;
    details: string;
    price: number;
    status: string | null;
    condition: string | null;
    category: string | null;
    municipality: string | null;
    administrativeDivision: string | null;
    country: string | null;
}

/*  --  TEMPORARY DATA FOR DEMONSTRATION PURPOSES   --  */
const COUNTRIES: { name: string; iso2: string; currency: string }[] = [
    { name: "Brazil", iso2: "BR", currency: "R$" },
    { name: "United States", iso2: "US", currency: "$" },
];
const ADMINISTRATIVE_DIVISIONS: {
    name: string;
    country: string;
    iso2: string;
}[] = [
    { name: "São Paulo", country: "Brazil", iso2: "SP" },
    { name: "New York", country: "United States", iso2: "NY" },
    { name: "California", country: "United States", iso2: "CA" },
];
const MUNICIPALITIES: {
    name: string;
    administrativeDivision: string;
    country: string;
}[] = [
    {
        name: "São Paulo",
        administrativeDivision: "São Paulo",
        country: "Brazil",
    },
    {
        name: "Taboão da Serra",
        administrativeDivision: "São Paulo",
        country: "Brazil",
    },
    {
        name: "New York City",
        administrativeDivision: "New York",
        country: "United States",
    },
    {
        name: "San Francisco",
        administrativeDivision: "California",
        country: "United States",
    },
];

const CATEGORIES = [
    { value: "APPAREL_FASHION", label: "Apparel" },
    { value: "ELECTRONICS", label: "Electronics" },
];
const CONDITIONS = [
    { value: "UNUSED", label: "Unused" },
    { value: "LIKE_NEW", label: "Like new" },
    { value: "GOOD", label: "Good" },
    { value: "FAIR", label: "Fair" },
    { value: "POOR", label: "Poor" },
];
const STATUSES = [
    {
        value: "ON_SALE",
        label: "On Sale",
    },
    { value: "DRAFT", label: "Draft" },
];

//  MAIN
export default function NewListing(): React.JSX.Element {
    const router = useRouter();
    const { user, loading } = useRequiredAuth();
    const { country } = useParams<{ country: string }>();

    const [processing, setProcessing] = useState<boolean>(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [listing, setListing] = useState<Listing>({
        images: [],
        title: "",
        details: "",
        price: 0.0,
        status: null,
        condition: null,
        category: null,
        municipality: user?.municipality ?? null,
        administrativeDivision: user?.administrativeDivision ?? null,
        country: findCountryName(country),
    });

    useEffect(() => {
        if (!loading && !user) router.push("/");

        setUserDefaultListing();
    }, [user, loading]);

    if (loading) return <>Checking...</>;
    if (!user) redirect("/");

    function setUserDefaultListing(): void {
        setListing({
            images: [],
            title: "",
            details: "",
            price: 0.0,
            status: null,
            condition: null,
            category: null,
            municipality: user?.municipality ?? null,
            administrativeDivision: user?.administrativeDivision ?? null,
            country: user?.country
                ? findCountryName(user.country)
                : findCountryName(country),
        });
    }

    function findCountryName(iso: string): string {
        return (
            COUNTRIES.find((country) => country.iso2 === iso.toUpperCase())
                ?.name ?? ""
        );
    }

    //  Handles TextField change
    function handleOnChangeTextField(name: string, value: string): void {
        setListing((prev) => ({
            ...prev,
            [name]: name === "price" ? Number.parseFloat(value) : value,
        }));
    }

    //  Handles Autocomplete component change
    function handleOnChangeDropDown(name: string, value: string | null): void {
        console.log(`${name} && ${value}`);
        if (value) {
            if (name === "country") {
                setListing((prev) => ({
                    ...prev,
                    municipality: "",
                    administrativeDivision: "",
                }));
            }

            if (name === "administrativeDivision") {
                setListing((prev) => ({
                    ...prev,
                    municipality: "",
                }));
            }

            setListing((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    }

    function handleOnChangeInputFile(
        e: React.ChangeEvent<HTMLInputElement>,
    ): void {
        const files = Array.from(e.target.files ?? []);

        setImageFiles((prev) => [...prev, ...files]);
    }

    function forward(index: number): string {
        const next = index === 0 ? imageFiles.length - 1 : index - 1;

        return "slide" + next;
    }

    function backward(index: number): string {
        const prev = index === imageFiles.length - 1 ? 0 : index + 1;

        return "slide" + prev;
    }

    async function uploadImage(file: File): Promise<string> {
        const formData = new FormData();

        formData.append("file", file);

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload image");
        }

        const data: { url: string } = await response.json();

        return data.url;
    }

    async function removeImage(img: string): Promise<void> {
        await fetch("/api/upload", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: img }),
        });
    }

    async function handleOnSubmit(
        event: React.SubmitEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();

        setProcessing(true);

        let uploadedImages: string[] = [];

        try {
            if (imageFiles.length === 0) return;

            uploadedImages = await Promise.all(
                imageFiles.map((file) => uploadImage(file)),
            );

            const listingToCreate = {
                ...listing,
                price: Math.round(listing.price * 100),
                images: uploadedImages,
            };

            setListing(listingToCreate);

            const token = getCsrfToken();

            if (!token) throw new Error("CSRF Token is missing.");

            const res = await fetch(`${env("BACKEND_URL")}/listings/create`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": token,
                },
                body: JSON.stringify(listingToCreate),
            });

            if (!res.ok) {
                throw new Error("Failed to create listing.");
            }

            setUserDefaultListing();
            setImageFiles([]);
        } catch (err) {
            await Promise.all(uploadedImages.map(removeImage));
            throw new Error("Server request failed.");
        } finally {
            setProcessing(false);
        }
    }

    return (
        <div className="flex flex-col justify-center items-center mt-5 mb-5 gap-5">
            <form
                onSubmit={handleOnSubmit}
                className="flex flex-col w-150 gap-2"
            >
                <fieldset
                    disabled={processing}
                    className="fieldset bg-base-100 border-base-300 border p-4"
                >
                    <legend>New item details</legend>

                    <label className="label">Title</label>
                    <input
                        name="title"
                        type="text"
                        value={listing.title}
                        className="input w-full"
                        placeholder="Title"
                        onChange={(e) =>
                            handleOnChangeTextField(
                                e.target.name,
                                e.target.value,
                            )
                        }
                        required
                    />

                    <label className="label">Details</label>
                    <textarea
                        name="details"
                        value={listing.details}
                        className="textarea w-full h-34"
                        placeholder="Details or other information about the item"
                        onChange={(e) =>
                            handleOnChangeTextField(
                                e.target.name,
                                e.target.value,
                            )
                        }
                    ></textarea>

                    <label className="label">Price</label>
                    <input
                        name="price"
                        type="number"
                        value={listing.price}
                        className="input validator text-end w-full"
                        required
                        placeholder="$3.00"
                        min={3}
                        step={0.01}
                        title="Must be at minimum of $3.00 USD"
                        onChange={(e) =>
                            handleOnChangeTextField(
                                e.target.name,
                                e.target.value,
                            )
                        }
                    />
                    <p className="validator-hint">
                        Must be at minimum of $3.00 USD
                    </p>

                    <div className="grid grid-cols-3 gap-1">
                        {/** CATEGORY SELECT */}
                        <select
                            name="category"
                            value={listing.category ?? "Category"}
                            onChange={(e) =>
                                handleOnChangeDropDown(
                                    e.target.name,
                                    e.target.value,
                                )
                            }
                            className="select"
                        >
                            <option disabled>Category</option>
                            {CATEGORIES.map((category, index) => (
                                <option key={index} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                        {/** CONDITION SELECT */}
                        <select
                            name="condition"
                            value={listing.condition ?? "Condition"}
                            onChange={(e) =>
                                handleOnChangeDropDown(
                                    e.target.name,
                                    e.target.value,
                                )
                            }
                            className="select"
                        >
                            <option disabled>Condition</option>
                            {CONDITIONS.map((condition, index) => (
                                <option key={index} value={condition.value}>
                                    {condition.label}
                                </option>
                            ))}
                        </select>
                        {/** STATUS SELECT */}
                        <select
                            name="status"
                            value={listing.status ?? "Status"}
                            onChange={(e) =>
                                handleOnChangeDropDown(
                                    e.target.name,
                                    e.target.value,
                                )
                            }
                            className="select"
                        >
                            <option disabled>Status</option>
                            {STATUSES.map((status, index) => (
                                <option key={index} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </fieldset>
                <fieldset
                    disabled={processing}
                    className="fieldset grid grid-cols-3 gap-1"
                >
                    {/** COUNTRY SELECT */}
                    <select
                        value={user.country ?? country ?? ""}
                        disabled={user.country ? true : country ? true : false}
                        className="select"
                    >
                        <option disabled value="">
                            Country
                        </option>
                        <option>
                            {user.country
                                ? user.country
                                : findCountryName(country)}
                        </option>
                    </select>
                    {/** ADMINISTRATIVE DIVISION SELECT */}
                    <select
                        className="select"
                        value={listing.administrativeDivision ?? ""}
                        onChange={(e) =>
                            handleOnChangeDropDown(
                                "administrativeDivision",
                                e.target.value,
                            )
                        }
                        disabled={
                            user.administrativeDivision
                                ? true
                                : listing.country
                                  ? false
                                  : true
                        }
                    >
                        <option disabled value="">
                            Administrative Division
                        </option>
                        {ADMINISTRATIVE_DIVISIONS.filter(
                            (division) => division.country === listing.country,
                        ).map((result, index) => (
                            <option key={index} value={result.name}>
                                {result.name}
                            </option>
                        ))}
                    </select>
                    {/** MUNICIPALITY SELECT */}
                    <select
                        className="select"
                        value={listing.municipality ?? ""}
                        onChange={(e) =>
                            handleOnChangeDropDown(
                                "municipality",
                                e.target.value,
                            )
                        }
                        disabled={
                            user.municipality
                                ? true
                                : listing.administrativeDivision
                                  ? false
                                  : true
                        }
                    >
                        <option disabled value="">
                            Municipality
                        </option>
                        {MUNICIPALITIES.filter(
                            (muni) =>
                                muni.administrativeDivision ===
                                listing.administrativeDivision,
                        ).map((result, index) => (
                            <option key={index} value={result.name}>
                                {result.name}
                            </option>
                        ))}
                    </select>
                </fieldset>
                <fieldset disabled={processing} className="fieldset">
                    <legend className="fieldset-legend">
                        Upload images of your new item
                    </legend>
                    <input
                        type="file"
                        multiple
                        required
                        className="file-input file-input-ghost"
                        onChange={handleOnChangeInputFile}
                    />
                </fieldset>
                <button className="btn btn-primary" disabled={processing}>
                    {processing ? (
                        <span className="loading loading-spinner"></span>
                    ) : (
                        "SELL"
                    )}
                </button>
            </form>
            <div className="carousel w-150 bg-base-300 h-64">
                {imageFiles.length === 0 && <h1 className="m-auto">IMAGE</h1>}
                {imageFiles.map((file, i) => (
                    <div
                        key={i}
                        id={`slide${i}`}
                        className="carousel-item relative w-full"
                    >
                        <Image
                            alt={file.name}
                            src={URL.createObjectURL(file)}
                            fill
                            className="object-contain"
                        />
                        <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                            <a
                                href={`#${forward(i)}`}
                                className="btn btn-circle"
                            >
                                <LuChevronLeft />
                            </a>
                            <a
                                href={`#${backward(i)}`}
                                className="btn btn-circle"
                            >
                                <LuChevronRight />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
//  OLD VERSION(S)

/*
function MuiListingForm(): React.JSX.Element {
    const router = useRouter();
    const { user, loading } = useRequiredAuth();
    const { country } = useParams<{ country: string }>();

    const [processing, setProcessing] = useState<boolean>(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [listing, setListing] = useState<Listing>({
        images: [],
        title: "",
        details: "",
        price: 0.0,
        status: STATUSES[1].label,
        condition: "",
        municipality: "",
        administrativeDivision: "",
        country: findCountryName(country),
    });

    useEffect(() => {
        if (!loading && !user) router.push("/");

        setUserDefaultListing();
    }, [user, loading]);

    if (loading) return <>Checking...</>;
    if (!user) redirect("/");

    function setUserDefaultListing(): void {
        setListing({
            images: [],
            title: "",
            details: "",
            price: 0.0,
            status: STATUSES[1].label,
            condition: "",
            municipality: user?.municipality ?? "",
            administrativeDivision: user?.administrativeDivision ?? "",
            country: user?.country
                ? findCountryName(user.country)
                : findCountryName(country),
        });
    }

    function findCountryName(iso: string): string {
        return (
            COUNTRIES.find((country) => country.iso2 === iso.toUpperCase())
                ?.name ?? ""
        );
    }

    function getAdministrativeDivisionOptions(): string[] {
        return ADMINISTRATIVE_DIVISIONS.filter(
            (division) =>
                division.country ===
                COUNTRIES.find((c) => c.iso2 === country.toUpperCase())?.name,
        ).map((division) => division.name);
    }

    function getMunicipalityOptions(): string[] {
        return MUNICIPALITIES.filter(
            (muni) =>
                muni.administrativeDivision === listing.administrativeDivision,
        ).map((muni) => muni.name);
    }

    function getCountryValue(): string {
        const iso: string = (user?.country ?? country).toUpperCase();

        return COUNTRIES.find((c) => c.iso2 === iso)?.name ?? "";
    }
    //  Handles TextField change
    function handleOnChangeTextField(
        e: React.ChangeEvent<HTMLInputElement>,
    ): void {
        const name: string = e.target.name;
        let value: string | number = e.target.value;

        if (name === "price") value = Number.parseFloat(value);

        setListing((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    //  Handles Autocomplete component change
    function handleOnChangeDropDown(name: string, value: string | null): void {
        if (value) {
            if (name === "country") {
                setListing((prev) => ({
                    ...prev,
                    municipality: "",
                    administrativeDivision: "",
                }));
            }

            if (name === "administrativeDivision") {
                setListing((prev) => ({
                    ...prev,
                    municipality: "",
                }));
            }

            setListing((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    }

    async function uploadImage(file: File): Promise<string> {
        const formData = new FormData();

        formData.append("file", file);

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload image");
        }

        const data: { url: string } = await response.json();

        return data.url;
    }

    async function removeImage(img: string): Promise<void> {
        await fetch("/api/upload", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: img }),
        });
    }

    async function handleOnSubmit(
        event: React.SubmitEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();

        setProcessing(true);

        let uploadedImages: string[] = [];

        try {
            if (imageFiles.length === 0) return;

            uploadedImages = await Promise.all(
                imageFiles.map((file) => uploadImage(file)),
            );

            const listingToCreate = {
                ...listing,
                price: Math.round(listing.price * 100),
                images: uploadedImages,
            };

            setListing(listingToCreate);

            const token = getCsrfToken();

            if (!token) throw new Error("CSRF Token is missing.");

            const res = await fetch(
                "http://localhost:8080/api/listings/create",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-XSRF-TOKEN": token,
                    },
                    body: JSON.stringify(listingToCreate),
                },
            );

            if (!res.ok) {
                throw new Error("Failed to create listing.");
            }

            setUserDefaultListing();
            setImageFiles([]);
        } catch (err) {
            await Promise.all(uploadedImages.map(removeImage));
            throw new Error("Server request failed.");
        } finally {
            setProcessing(false);
        }
    }
    return (<Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                width: "100%",
                paddingBottom: 5,
            }}
        >
            <Card sx={{ width: 600, minWidth: 500 }}>
                <div
                    className={`${imageFiles.length === 0 && "flex justify-center items-center border"} w-full h-70`}
                >
                    {imageFiles.map((img, index) => (
                        <CardMedia
                            key={index}
                            component="img"
                            sx={{
                                height: "100%",
                                objectFit: "contain",
                            }}
                            image={URL.createObjectURL(img)}
                        />
                    ))}
                    {imageFiles.length === 0 && (
                        <p className="text-xl font-bold">IMAGE</p>
                    )}
                </div>
                <CardContent>
                    <form
                        className="flex flex-col gap-5"
                        onSubmit={handleOnSubmit}
                    >
                        <div className="flex justify-between items-center gap-1">
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<UploadFile />}
                            >
                                Upload Image
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    onChange={(event) => {
                                        const files = Array.from(
                                            event.target.files ?? [],
                                        );

                                        setImageFiles((prev) => [
                                            ...prev,
                                            ...files,
                                        ]);
                                    }}
                                />
                            </Button>
                            <p className="italic line-clamp-1">
                                {imageFiles.length > 0
                                    ? imageFiles[0].name
                                    : "no image selected"}
                            </p>
                        </div>
                        <fieldset
                            className="flex flex-col w-full gap-5"
                            disabled={processing}
                        >
                            <TextField
                                id="title"
                                name="title"
                                type="text"
                                label="Title"
                                required
                                sx={{ width: "100%" }}
                                value={listing.title}
                                onChange={handleOnChangeTextField}
                            />
                            <TextField
                                id="details"
                                name="details"
                                type="text"
                                label="Details"
                                multiline
                                required
                                minRows={5}
                                maxRows={10}
                                value={listing.details}
                                onChange={handleOnChangeTextField}
                            />
                            <TextField
                                id="price"
                                name="price"
                                label="Price"
                                placeholder="0.00"
                                type="number"
                                required
                                onChange={handleOnChangeTextField}
                                slotProps={{
                                    htmlInput: {
                                        step: "0.01",
                                        min: "0",
                                    },
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                {
                                                    COUNTRIES.find(
                                                        (c) =>
                                                            c.iso2 ===
                                                            country.toUpperCase(),
                                                    )?.currency
                                                }
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </fieldset>
                        <div className="flex items-center gap-2">
                            <Autocomplete
                                disablePortal
                                sx={{ width: "50%" }}
                                value={
                                    CONDITIONS.find(
                                        (condition) =>
                                            condition.value ===
                                            listing.condition,
                                    ) ?? null
                                }
                                onChange={(_, option) => {
                                    if (option)
                                        handleOnChangeDropDown(
                                            "condition",
                                            option.value,
                                        );
                                }}
                                options={CONDITIONS}
                                disabled={processing}
                                getOptionLabel={(option) => option.label}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Condition"
                                        required
                                    />
                                )}
                            />

                            <Autocomplete
                                disablePortal
                                sx={{ width: "50%" }}
                                options={STATUSES}
                                disabled={processing}
                                getOptionLabel={(option) => option.label}
                                value={
                                    STATUSES.find(
                                        (status) =>
                                            status.value === listing.status,
                                    ) ?? null
                                }
                                onChange={(_, option) => {
                                    if (option)
                                        handleOnChangeDropDown(
                                            "status",
                                            option.value,
                                        );
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Status"
                                        required
                                    />
                                )}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Autocomplete
                                disablePortal
                                sx={{ width: "50%" }}
                                value={listing.municipality}
                                onChange={(_, value) =>
                                    handleOnChangeDropDown(
                                        "municipality",
                                        value,
                                    )
                                }
                                disabled={
                                    processing
                                        ? true
                                        : listing.administrativeDivision
                                          ? false
                                          : true
                                }
                                options={getMunicipalityOptions()}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Municipality"
                                        onChange={(e) =>
                                            (listing.municipality =
                                                e.target.value)
                                        }
                                        required
                                    />
                                )}
                            />

                            <Autocomplete
                                disablePortal
                                sx={{ width: "50%" }}
                                value={listing.administrativeDivision}
                                onChange={(_, value) => {
                                    handleOnChangeDropDown(
                                        "administrativeDivision",
                                        value,
                                    );
                                }}
                                disabled={
                                    processing
                                        ? true
                                        : listing.country
                                          ? false
                                          : true
                                }
                                options={getAdministrativeDivisionOptions()}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Administrative Division"
                                        onChange={(e) =>
                                            (listing.administrativeDivision =
                                                e.target.value)
                                        }
                                        required
                                    />
                                )}
                            />

                            <Autocomplete
                                disablePortal
                                sx={{ width: "50%" }}
                                value={getCountryValue()}
                                options={COUNTRIES.map((c) => c.name)}
                                disabled={
                                    processing
                                        ? true
                                        : user.country
                                          ? true
                                          : country
                                            ? true
                                            : false
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Country"
                                        onChange={(e) =>
                                            (listing.country = e.target.value)
                                        }
                                        required
                                    />
                                )}
                            />
                        </div>
                        <Button type="submit" variant="contained">
                            Sell
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>)
} */
