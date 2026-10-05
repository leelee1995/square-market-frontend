"use client";

import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api-error";
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
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
                {
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
                },
            );

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
