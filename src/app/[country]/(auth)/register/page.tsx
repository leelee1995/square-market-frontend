"use client";

import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api-error";
import { env } from "@/lib/env";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuInfo } from "react-icons/lu";

//  -- Types --

type RegisterFormData = {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type RegistrationFormErrors = {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export default function Register(): React.JSX.Element {
    const router = useRouter();
    const { user, setUser } = useAuth();
    const { country } = useParams<{ country: string }>();

    //  -- Hooks --
    const [formFields, setFormFields] = useState<RegisterFormData>({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [formFieldErrors, setFormFieldErrors] =
        useState<RegistrationFormErrors>({
            username: "",
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
        });

    const [loading, setLoading] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    //  -- CSS Styles --
    const fieldsetClasses =
        "flex flex-col fieldset border border-base-100 rounded-box p-4 [&_.input]:w-full";

    useEffect(() => {
        if (user) router.push("/");
    }, [user]);
    //  -- Functions --

    function updateFormFields(k: keyof RegisterFormData, v: string) {
        if (
            k === "username" ||
            k === "firstName" ||
            k === "email"
            //k === "phoneNumber"
        )
            v = v.trim();
        if (k === "username") v = v.replace(/[^\w]/g, "").slice(0, 20);
        if (k === "firstName" || k === "lastName") v = v.toUpperCase();
        //if (k === "phoneNumber") v = v.replace(/\D/g, "");

        setFormFields((prev) => ({
            ...prev,
            [k]: v,
        }));
    }

    function checkFormFields() {
        const formErrors: RegistrationFormErrors = {
            username: "",
            firstName: "",
            lastName: "",
            email: "",
            //phoneNumber: "",
            password: "",
            confirmPassword: "",
        };

        if (formFields.username.length < 3 || formFields.username.length > 20) {
            formErrors.username = "Username must be between 3 to 20 characters";
        }

        if (formFields.firstName.length < 1) {
            formErrors.firstName =
                "First name must be more than 1 alphabet characters.";
        }

        if (formFields.lastName.length === 1) {
            formErrors.lastName =
                "Last name must be more than 1 alphabet characters or leave this field blank.";
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formFields.email) ||
            formFields.email.length < 6
        ) {
            ((formErrors.email = "email"), "Please enter a valid email.");
        }

        /**
        if (Number.isNaN(Number(formFields.phoneNumber))) {
            formErrors.phoneNumber = "Please enter a valid phone number.";
        }

        if (formFields.phoneNumber.length < 9) {
            formErrors.phoneNumber = "Enter the correct amount of digits.";
        }
         */

        if (formFields.password.length < 8 || formFields.password.length > 32) {
            formErrors.password = "Please enter 8 or more characters.";
        }

        if (formFields.confirmPassword.length === 0) {
            formErrors.confirmPassword = "Please re-type your password.";
        }

        if (
            formFields.password.length >= 8 &&
            formFields.password !== formFields.confirmPassword
        ) {
            formErrors.confirmPassword =
                "Confirmation password does not match.";
        }

        setFormFieldErrors(formErrors);

        return Object.values(formErrors).every((error) => error === "");
    }

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        setLoading(true);
        setSubmitting(true);
        setError("");

        if (!checkFormFields()) {
            setLoading(false);
            setSubmitting(false);
            setError("");

            return;
        }

        try {
            const res = await fetch(`${env("BACKEND_URL")}/auth/register`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formFields.username,
                    email: formFields.email,
                    firstName: formFields.firstName,
                    lastName: formFields.lastName,
                    password: formFields.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new ApiError(
                    data.message ?? "Registration failed",
                    res.status,
                    data.fieldErrors,
                );
            }

            setUser(data);
            router.push("/");
        } catch (err) {
            if (err instanceof ApiError) {
                setSubmitting(false);
                setError(err.message);

                if (err.status === 409) {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setError("Something went wrong.");
            }
        }
    }

    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="card bg-base-200 shadow-md w-96 lg:w-120">
                <div className="card-body">
                    <Link
                        href="/"
                        className="btn btn-soft btn-primary self-start"
                    >
                        <span>
                            <LuChevronLeft size={20} />
                        </span>
                        GO BACK
                    </Link>
                    <h2 className="card-title text-2xl mt-4">
                        Create Your Account
                    </h2>
                    <form onSubmit={handleSubmit}>
                        {/* ACCOUNT CREDENTIAL INPUTS*/}

                        <fieldset className={fieldsetClasses}>
                            <legend className="fieldset-legend">
                                Account credentials
                            </legend>

                            <label className="label">
                                <span>Username</span>
                                <div className="tooltip tooltip-right tooltip-info">
                                    <div className="tooltip-content">
                                        <div className="text-md font-bold">
                                            Must be between 3 and 32 characters
                                        </div>
                                    </div>
                                    <LuInfo className="hover:text-info hover:cursor-help" />
                                </div>
                            </label>
                            <input
                                required
                                name="username"
                                type="text"
                                placeholder="Type your username"
                                className="input"
                                disabled={loading}
                                value={formFields.username}
                                onChange={(e) =>
                                    updateFormFields("username", e.target.value)
                                }
                            />

                            <label className="label">Email</label>
                            <input
                                required
                                name="email"
                                type="text"
                                placeholder="Enter your email"
                                className="input"
                                disabled={loading}
                                value={formFields.email}
                                onChange={(e) =>
                                    updateFormFields("email", e.target.value)
                                }
                            />
                        </fieldset>

                        {/* SECURITY INPUTS*/}

                        <fieldset className={fieldsetClasses}>
                            <legend className="fieldset-legend">
                                Security
                            </legend>

                            <label className="label">
                                <span>Password</span>
                                <div className="tooltip tooltip-right tooltip-info">
                                    <div className="tooltip-content">
                                        <div className="text-md font-bold">
                                            Must be between 8 and 72 characters
                                        </div>
                                    </div>
                                    <LuInfo className="hover:text-info hover:cursor-help" />
                                </div>
                            </label>
                            <input
                                required
                                name="password"
                                type="password"
                                placeholder="Enter password"
                                className="input"
                                disabled={loading}
                                onChange={(e) =>
                                    updateFormFields("password", e.target.value)
                                }
                            />

                            <label className="label">
                                Password Confirmation
                            </label>
                            <input
                                required
                                type="password"
                                placeholder="Confirm entered password"
                                className="input"
                                disabled={loading}
                                onChange={(e) =>
                                    updateFormFields(
                                        "confirmPassword",
                                        e.target.value,
                                    )
                                }
                            />
                        </fieldset>

                        {/* PERSONAL INFO INPUTS*/}

                        <fieldset className={fieldsetClasses}>
                            <legend className="fieldset-legend">
                                Personal information
                            </legend>

                            <label className="label">
                                <span>First name</span>
                                <div className="tooltip tooltip-right tooltip-info">
                                    <div className="tooltip-content">
                                        <div className="text-md font-bold">
                                            Must be at least 2 characters
                                        </div>
                                    </div>
                                    <LuInfo className="hover:text-info hover:cursor-help" />
                                </div>
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="Type your first name"
                                className="input"
                                disabled={loading}
                                value={formFields.firstName}
                                onChange={(e) =>
                                    updateFormFields(
                                        "firstName",
                                        e.target.value,
                                    )
                                }
                            />

                            <label className="label">
                                Last name (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="Type your last name"
                                className="input"
                                disabled={loading}
                                value={formFields.lastName}
                                onChange={(e) =>
                                    updateFormFields("lastName", e.target.value)
                                }
                            />
                        </fieldset>

                        <button
                            disabled={loading}
                            type="submit"
                            className="btn btn-primary w-full mt-2"
                        >
                            Create Account{" "}
                            {loading ?? (
                                <span className="loading loading-spinner"></span>
                            )}
                        </button>
                    </form>
                    <p className="text-xs text-center mt-2">
                        Already have an account?{" "}
                        <Link
                            href={`/${country}/login`}
                            className="text-blue-500 underline decoration-dotted"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

// function MuiForm(): React.JSX.Element {
//     return (<div className="flex justify-center items-center h-full">
//             <div className="flex flex-col sm:w-1/2 lg:w-1/3 h-2/3 gap-2">
//                 <Button
//                     component="a"
//                     href="/"
//                     variant="outlined"
//                     startIcon={<ArrowBackIos />}
//                     sx={{ alignSelf: "start" }}
//                 >
//                     Go back
//                 </Button>
//                 <form
//                     noValidate
//                     onSubmit={handleSubmit}
//                     className="flex flex-col w-full h-fit gap-5 p-4 shadow"
//                 >
//                     <h1 className="text-3xl font-semibold self-center">
//                         Create your Huberce Account
//                     </h1>

//                     {error && <p className="text-red-500 text-sm">{error}</p>}

//                     <fieldset className="flex flex-col gap-2">
//                         <div className="flex flex-col gap-1">
//                             <TextField
//                                 onChange={(e) =>
//                                     updateFormFields("username", e.target.value)
//                                 }
//                                 id="username"
//                                 label="Username"
//                                 variant="outlined"
//                                 error={!!formFieldErrors.username}
//                                 helperText={formFieldErrors.username}
//                                 autoComplete="username"
//                                 slotProps={{
//                                     htmlInput: { maxLength: 20, minLength: 3 },
//                                 }}
//                                 required
//                                 disabled={loading}
//                                 value={formFields.username}
//                             />
//                             <div className="flex justify-start items-start text-blue-300 text-xs gap-1">
//                                 <InfoOutlined sx={{ fontSize: 16 }} />
//                                 <p>
//                                     Username must be between 3 to 20 characters
//                                 </p>
//                             </div>
//                         </div>

//                         <TextField
//                             onChange={(e) =>
//                                 updateFormFields("email", e.target.value)
//                             }
//                             id="email"
//                             label="Email"
//                             variant="outlined"
//                             error={!!formFieldErrors.email}
//                             helperText={formFieldErrors.email}
//                             autoComplete="email"
//                             value={formFields.email}
//                             required
//                             disabled={loading}
//                         />
//                     </fieldset>

//                     <fieldset className="flex gap-2">
//                         <TextField
//                             onChange={(e) =>
//                                 updateFormFields("firstName", e.target.value)
//                             }
//                             id="firstName"
//                             label="First Name"
//                             variant="outlined"
//                             error={!!formFieldErrors.firstName}
//                             helperText={formFieldErrors.firstName}
//                             autoComplete="first-name"
//                             required
//                             disabled={loading}
//                             value={formFields.firstName}
//                             className="w-1/2"
//                         />
//                         <TextField
//                             onChange={(e) =>
//                                 updateFormFields("lastName", e.target.value)
//                             }
//                             id="lastName"
//                             label="Last Name (Optional)"
//                             variant="outlined"
//                             autoComplete="last-name"
//                             error={!!formFieldErrors.lastName}
//                             helperText={formFieldErrors.lastName}
//                             disabled={loading}
//                             value={formFields.lastName}
//                             className="w-1/2"
//                         />
//                     </fieldset>

//                     <fieldset className="flex gap-2">
//                         <div className="flex flex-col gap-1 w-1/2">
//                             <TextField
//                                 onChange={(e) =>
//                                     updateFormFields("password", e.target.value)
//                                 }
//                                 id="password"
//                                 type="password"
//                                 label="Password"
//                                 variant="outlined"
//                                 error={!!formFieldErrors.password}
//                                 helperText={formFieldErrors.password}
//                                 autoComplete="password"
//                                 required
//                                 disabled={loading}
//                             />
//                             <div className="flex justify-start items-start text-blue-300 text-xs gap-1">
//                                 <InfoOutlined sx={{ fontSize: 16 }} />
//                                 <p>
//                                     Password must be betwee 8 to 32 characters
//                                 </p>
//                             </div>
//                         </div>
//                         <TextField
//                             onChange={(e) =>
//                                 updateFormFields(
//                                     "confirmPassword",
//                                     e.target.value,
//                                 )
//                             }
//                             id="password"
//                             type="password"
//                             label="Confirm Password"
//                             variant="outlined"
//                             error={!!formFieldErrors.confirmPassword}
//                             helperText={formFieldErrors.confirmPassword}
//                             autoComplete="confirmation-password"
//                             required
//                             disabled={loading}
//                             className="w-1/2"
//                         />
//                     </fieldset>

//                     <Button
//                         fullWidth
//                         type="submit"
//                         variant="contained"
//                         loading={submitting}
//                         loadingPosition="end"
//                         disabled={loading}
//                     >
//                         Create Account
//                     </Button>
//                 </form>
//                 <div className="flex gap-1 text-sm">
//                     <p>Already have an account?</p>
//                     <Link
//                         href={`/${country}/login`}
//                         className="underline text-blue-300 hover:text-blue-200"
//                     >
//                         Log in
//                     </Link>
//                 </div>
//             </div>
//         </div>)
// }
