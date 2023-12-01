import React from 'react';
import styles from './footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p>Made with <span className={styles.heart}>&hearts;</span> by Daniel White</p>
            <div className={styles.links}>
                <a href="https://github.com/daniel-maxwell/YouTube-Clone" target="_blank" rel="noopener noreferrer">Github Repo  </a>
                <a href="https://daniel-maxwell.github.io/Portfolio/" target="_blank" rel="noopener noreferrer">Portfolio  </a>
                <a href="https://www.linkedin.com/in/daniel-maxwell-white/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
        </footer>
    );
}

export default Footer;