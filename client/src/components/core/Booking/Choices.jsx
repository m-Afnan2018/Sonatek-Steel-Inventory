import React, { useEffect, useState } from 'react'
import style from './Booking.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { bookingItems } from 'services/operations/bookingAPI';

const Choices = () => {
    const { bestSuggestion, allSuggestion, allChoices, requirement } = useSelector(state => state.booking);
    const [showChoices, setShowChoices] = useState(false);

    const dispatch = useDispatch();

    const [selectChoices, setSelectChoices] = useState([]);

    useEffect(() => {
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

    const onBookinging = (items) => {
        if (items.length <= 0) {
            return;
        }
        console.log({ items }, { requirement })
        bookingItems({ items: [...items], requirement }, dispatch)
    }

    return (
        <div className={style.choices} style={{ height: showChoices ? '20rem' : '0', overflow: showChoices ? 'scroll' : 'hidden' }}>
            {/* Best Suggestion */}
            {/* <div>
                <h2>Best Suggestion</h2>
                <div className={style.groupItem}>
                    <div className={style.singleItem}>
                        <h4>Wagon Number</h4>
                        <h4>Quantity</h4>
                    </div>
                    <div className={style.singleItem}>
                        <h4>Wagon Number</h4>
                        <h4>Quantity</h4>
                    </div>
                    <div className={style.singleItem}>
                        <h4>Wagon Number</h4>
                        <h4>Quantity</h4>
                    </div>
                    <div className={style.confirmationButton}>
                        <button>Booking this one</button>
                    </div>
                </div>
            </div> */}

            {/* All Suggestions */}
            {/* <div>
                <h2>All Suggestions</h2>
                <div>
                    <div className={style.groupItem}>
                        <div className={style.singleItem}>
                            <h4>Wagon Number</h4>
                            <h4>Quantity</h4>
                        </div>
                        <div className={style.singleItem}>
                            <h4>Wagon Number</h4>
                            <h4>Quantity</h4>
                        </div>
                        <div className={style.singleItem}>
                            <h4>Wagon Number</h4>
                            <h4>Quantity</h4>
                        </div>
                        <div className={style.confirmationButton}>
                            <button>Booking this one</button>
                        </div>
                    </div>
                    <div className={style.groupItem}>
                        <div className={style.singleItem}>
                            <h4>Wagon Number</h4>
                            <h4>Quantity</h4>
                        </div>
                        <div className={style.singleItem}>
                            <h4>Wagon Number</h4>
                            <h4>Quantity</h4>
                        </div>
                        <div className={style.singleItem}>
                            <h4>Wagon Number</h4>
                            <h4>Quantity</h4>
                        </div>
                        <div className={style.confirmationButton}>
                            <button>Booking this one</button>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* All Choices */}
            <div>
                <h2>All Choices</h2>
                <div className={style.groupItem}>
                    {
                        allChoices?.map((items) => {
                            return <div onClick={() => selecting(items._id)} style={{ backgroundColor: selectChoices.includes(items._id) ? '#065675' : '#001f2b' }} className={style.singleItem}>
                                <h4>{items.wagonNumber}</h4>
                                <h4>{items.quantity}</h4>
                            </div>
                        })
                    }
                    <div className={style.confirmationButton}>
                        <button onClick={() => onBookinging(selectChoices)}>Booking selected</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Choices