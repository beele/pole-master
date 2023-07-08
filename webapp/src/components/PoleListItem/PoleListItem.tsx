import styles from './PoleListItem.module.css';
import { useEffect } from "react";
import { Pole } from "../../../../api/node_modules/@prisma/client";

export default function PoleListItem(props: {pole: Pole}) {

    return(
        <li className={styles.listItem}>
            <div>{props.pole.name}</div>
            <span>{props.pole.inUse} / {props.pole.connectorCount}</span>
        </li>
    );
}
