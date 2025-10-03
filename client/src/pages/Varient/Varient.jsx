import React from 'react'
import style from './Varient.module.css'
import { useSelector } from 'react-redux';
import SingleBlock from 'components/core/Varient/SingleBlock';

const Varient = () => {
    const { grades, thicknesses, widths, cutters } = useSelector(state => state.varient);

    return (
        <div className={style.Varient}>
            <h2>Manage Varients</h2>

            {/* Block for Grades */}
            <SingleBlock list={grades} name={'Grade'} />
            <SingleBlock list={thicknesses} name={'Thickness'} />
            <SingleBlock list={cutters} name={'Cutter'} />
            <SingleBlock list={widths} name={'Width'} />
        </div >
    )
}

export default Varient