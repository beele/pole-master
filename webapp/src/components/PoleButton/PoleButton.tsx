import { useEffect, useRef } from 'react';
import styles from './PoleButton.module.css';

export default function PoleButton(props: {title: String, clickHandler: (event: React.MouseEvent) => void, bg?: string, bgHover?: string}) {

    const clickWrapper = (event: React.MouseEvent): void  => {
        event.preventDefault();
        props.clickHandler(event);
    };

    const buttonRef = useRef(null);

    useEffect(() => {
        if (!buttonRef.current) {
            return;
        }

        const button = buttonRef.current as HTMLButtonElement;
        button.style.setProperty('--bg', props.bg ?? 'white');
        button.style.setProperty('--bg-hover', props.bgHover ?? 'grey');

    }, [buttonRef, props.bg, props.bgHover]);

    return (
        <button ref={buttonRef} className={styles.poleButton} onClick={clickWrapper}>
            {props.title}
        </button>
    );
}
