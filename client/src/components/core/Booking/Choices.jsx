import React, { useEffect, useState } from 'react'
import style from './Booking.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { bookingItems } from 'services/operations/bookingAPI';
import { useOverlay } from 'hooks/useOverlay';
import SingleField from 'components/common/Overlay/SingleField';

const Choices = () => {
    const { bestSuggestion, allSuggestion, allChoices, options } = useSelector(state => state.booking);
    const { grades, thicknesses, widths } = useSelector((state) => state.varient);
    const [showChoices, setShowChoices] = useState(false);
    const [height, setHeight] = useState(0);

    const dispatch = useDispatch();
    const { showOverlay } = useOverlay()

    const [selectChoices, setSelectChoices] = useState([]);

    useEffect(() => {
        setSelectChoices([]);
        if (bestSuggestion === null && allSuggestion === null && allChoices === null) {
            setShowChoices(false);
        } else {
            setShowChoices(true);
        }
    }, [bestSuggestion, allSuggestion, allChoices])

    const selecting = (id) => {
        if (selectChoices.includes(id)) {
            setSelectChoices((prev) => prev.filter((i) => i !== id))
        } else {
            setSelectChoices([...selectChoices, id])
        }
    }

    useEffect(() => {
        if (allChoices) {
            let calculate = 5.75 + (allChoices.length * 1.75) + 1.5625 + 6.25;
            setHeight(calculate);
        }
    }, [allChoices])

    const onBookinging = (items) => {
        if (items.length <= 0) {
            return;
        }
        let mini = 0;
        let maxi = 0;
        items.forEach(element => {
            maxi += element.quantity;
            mini = Math.max(mini, element.quantity);
        });
        mini = maxi - mini;
        showOverlay(SingleField, {
            message: "Enter requirement and form type",
            range: { min: mini.toFixed(3), max: maxi.toFixed(3) },
            onAccept: (data) => {
                bookingItems({ items: [...items], ...data }, dispatch)
            }
        })
    }

    return (
        <div className={style.choices} style={{ height: showChoices ? `${height}rem` : '0', overflow: showChoices ? 'scroll' : 'hidden' }}>
            {options && <div className={style.selectedOptions}>
                <div>
                    <h4>Type:</h4>
                    <h4>{options.type}</h4>
                </div>
                <div>
                    <h4>Grade:</h4>
                    <h4>{(grades.filter(grade => grade._id === options?.grade))[0]?.name}</h4>
                </div>
                <div>
                    <h4>Thickness:</h4>
                    <h4>{(thicknesses.filter(thickness => thickness._id === options?.thickness))[0]?.name}</h4>
                </div>
                <div>
                    <h4>Width:</h4>
                    <h4>{(widths.filter(width => width._id === options?.width))[0]?.name}</h4>
                </div>
            </div>}

            {/* All Choices */}
            <div className={style.allChoices}>
                {allChoices && allChoices.length !== 0 && <h2>All Choices</h2>}
                {allChoices && allChoices.length === 0 &&
                    <h2>No Item found with that category</h2>
                }
                {allChoices?.length !== 0 && <div className={style.groupItem}>
                    {
                        allChoices?.map((items) => {
                            return <div onClick={() => selecting(items)} style={{ backgroundColor: selectChoices.includes(items) ? '#065675' : '#001f2b' }} className={style.singleItem}>
                                <h4>{items.shipTo.name || 'Not Reached'}</h4> X
                                <h4>{items.wagonNumber || 'Not Reached'}</h4> X
                                <h4>{items.quantity}</h4>
                            </div>
                        })
                    }
                    <div className={style.confirmationButton}>
                        <button onClick={() => onBookinging(selectChoices)}>Booking selected</button>
                    </div>
                </div>}
            </div>
        </div>
    )
}

export default Choices