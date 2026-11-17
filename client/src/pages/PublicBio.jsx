import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BioCard from "../components/BioCard";
import { Notice, Spinner, linkClass } from "../components/ui";
import { bioApi } from "../api/services";
import { getErrorMessage } from "../api/api";

export default function PublicBio() {
    const { username } = useParams();
    const [bio, setBio] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        setBio(null);
        setError("");
        bioApi.get(username)
            .then(({ data }) => setBio(data))
            .catch((err) => setError(err.response?.status === 404 ? "This bio page doesn't exist yet." : getErrorMessage(err)));
    }, [username]);

    return (
        <div className="flex min-h-dvh items-center justify-center bg-pop p-6">
            <div className="w-full max-w-sm rounded-[36px] bg-ink p-8 shadow-[10px_10px_0_#fff] sm:p-10">
                {!bio && !error && <div className="flex justify-center py-8"><Spinner /></div>}

                {error && (
                    <div className="space-y-4 text-center text-white">
                        <Notice>{error}</Notice>
                        <Link to="/" className={`${linkClass} text-white`}>Go to LinkHub</Link>
                    </div>
                )}

                {bio && (
                    <>
                        <BioCard username={bio.username} displayName={bio.displayName}
                            socialLinks={bio.socialLinks} customLinks={bio.customLinks || []} />
                        <Link to="/" className="mt-8 block text-center text-xs text-faint hover:text-white">Made with LinkHub</Link>
                    </>
                )}
            </div>
        </div>
    );
}
