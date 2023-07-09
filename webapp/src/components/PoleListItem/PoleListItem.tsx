import classnames from 'classnames';
import styles from './PoleListItem.module.css';
import { MdElectricCar } from "react-icons/md";
import { RiChargingPileFill } from "react-icons/ri";

import { Pole } from "../../../../api/node_modules/@prisma/client";
import { useState } from 'react';
import PoleButton from '../PoleButton/PoleButton';

export default function PoleListItem(props: {pole: Pole}) {

    const [expanded, setExpanded] = useState<Boolean>(false);

    const changeExpanded = () => {
        setExpanded(!expanded);
    };

    return(
        <li className={styles.listItem}>
            <div className={styles.poleImg} onClick={changeExpanded}>IMG</div>
            <div className={styles.poleTitle}><MdElectricCar />{props.pole.name}</div>
            <div className={classnames(styles.poleAvailability, expanded ? '' : styles.collapsed2)}><RiChargingPileFill /><span>{props.pole.inUse}&nbsp;/&nbsp;{props.pole.connectorCount}</span>available</div>
            <div className={classnames(styles.poleExpanded, expanded ? '' : styles.collapsed)}>
                <PoleButton title="Test 1" clickHandler={() => {console.log('clicked Test 1')}}/>
                <PoleButton title="Test 2" clickHandler={() => {console.log('clicked Test 2')}}/>
                <PoleButton title="Test 3" clickHandler={() => {console.log('clicked Test 3')}}/>
            </div>
        </li>
    );
}
