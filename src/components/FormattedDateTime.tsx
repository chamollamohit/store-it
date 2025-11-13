"use client";
import { cn, formatDateTime } from "@/lib/utils";
import React, { useEffect, useState } from "react";

const FormattedDateTime = ({
    date,
    className,
}: {
    date: string;
    className?: string;
}) => {
    const [formattedDate, setFormattedDate] = useState<string>("");

    // To ensure this run on users browser to get users timezone
    useEffect(() => {
        setFormattedDate(formatDateTime(date));
    }, [date]);
    return (
        <p className={cn("body-1 text-light-200", className)}>
            {formattedDate}
        </p>
    );
};

export default FormattedDateTime;
