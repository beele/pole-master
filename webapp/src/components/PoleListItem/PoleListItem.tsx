import classnames from 'classnames';
import styles from './PoleListItem.module.css';
import { MdElectricCar } from "react-icons/md";
import { RiChargingPileFill, RiDeleteBin6Line } from "react-icons/ri";

import { Pole } from "../../../../api/node_modules/@prisma/client";
import { useState } from 'react';
import PoleButton from '../PoleButton/PoleButton';

export default function PoleListItem(props: {pole: Pole}) {

    const [expanded, setExpanded] = useState<Boolean>(false);

    const changeExpanded = () => {
        setExpanded(!expanded);
    };

    const determineBackgroundColor = (connectorCount: number, inUse: number): string => {
        // https://www.schemecolor.com/classic-pales.php
        if (inUse === 0) {
            return '#D8F2E9';
        }
        if (inUse === connectorCount) {
            return '#FFBABA';
        }
        return '#FFE6C2';
    }

    return(
        <li className={styles.listItem} style={{backgroundColor: determineBackgroundColor(props.pole.connectorCount, props.pole.inUse)}}>
            <div className={styles.poleImg} onClick={changeExpanded}></div>
            <div className={styles.poleTitle}><MdElectricCar />{props.pole.name}</div>
            <div className={classnames(styles.poleAvailability, expanded ? '' : styles.collapsed2)}><RiChargingPileFill /><span>{props.pole.connectorCount - props.pole.inUse}&nbsp;/&nbsp;{props.pole.connectorCount}</span>available</div>
            <div className={classnames(styles.poleExpanded, expanded ? '' : styles.collapsed)}>
                <PoleButton clickHandler={() => {console.log('clicked Test 1')}} bg='#C7DAEE' bgHover='#AFCAE6'>
                    <span>Check in</span>
                </PoleButton>
                <PoleButton clickHandler={() => {console.log('clicked Test 2')}} bg='#C7DAEE' bgHover='#AFCAE6'>
                    <span>Details</span>
                </PoleButton>
                <PoleButton clickHandler={() => {console.log('clicked Test 3')}} bg='#C7DAEE' bgHover='#CC9595'>
                    <RiDeleteBin6Line/>
                    <span>Delete</span>
                </PoleButton>
            </div>
        </li>
    );
}
