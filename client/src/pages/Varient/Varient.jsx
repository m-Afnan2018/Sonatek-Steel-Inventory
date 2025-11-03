import React from 'react'
import style from './Varient.module.css'
import { useSelector } from 'react-redux';
import SingleBlock from 'components/core/Varient/SingleBlock';

const Varient = () => {
    const { grades, thicknesses, widths } = useSelector(state => state.varient);

    return (
        <div className={style.Varient}>
            {/* Block for Grades */}
            <SingleBlock list={thicknesses} name={'Thickness'} />
            <SingleBlock list={widths} name={'Width'} />
            <SingleBlock list={grades} name={'Grade'} />
            {/* <SingleBlock list={cutters} name={'Cutter'} /> */}
        </div >
    )
}

export default Varient