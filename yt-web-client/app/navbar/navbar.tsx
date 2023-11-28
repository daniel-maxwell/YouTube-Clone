'use client';
import Image from "next/image";
import Link from "next/link";
import styles from "./navbar.module.css";
import SignIn from "./sign-in";
import { onAuthStateChangedHelper } from "../firebase/firebase";
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import Upload from "./upload";

export default function Navbar() {
    // Init user state
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChangedHelper((user) => {setUser(user)});

        // Cleanup subscription on unmount
        return () => unsubscribe();
    });

    return (
        <nav className={styles.nav}>
            <Link href="/">
                <Image src="/youtube-logo.svg" alt="logo" width={90} height={20}/>
            </Link>
            {
              user && <Upload />
            }
            <SignIn user={user} />
        </nav>
    );
}