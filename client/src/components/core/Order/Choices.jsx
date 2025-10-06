import React, { useEffect, useState } from 'react'
import style from './Order.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { orderItems } from 'services/operations/orderAPI';

const Choices = () => {
    const { bestSuggestion, allSuggestion, allChoices, requirement } = useSelector(state => state.order);
    const [showChoices, setShowChoices] = useState(false);

    const dispatch = useDispatch();

    const [selectChoices, setSelectChoices] = useState([]);

    useEffect(() => {
        console.log("Here:", { bestSuggestion }, { allSuggestion }, { allChoices })
        if (bestSuggestion === null && allSuggestion === null && allChoices === null) {
            setShowChoices(false);
        } else {
            setShowChoices(true);
        }
    }, [bestSuggestion, allSuggestion, allChoices])

    const selecting = (id) => {
        console.log(id);
        console.log(selectChoices)
        if (selectChoices.includes(id)) {
            setSelectChoices((prev) => prev.filter((i) => i !== id))
        } else {
            setSelectChoices([...selectChoices, id])
        }
    }

    const onOrdering = (items) => {
        if (items.length <= 0) {
            return;
        }
        console.log({ items }, { requirement })
        orderItems({ items: [...items], requirement }, dispatch)
    }

    return (
        <div className={style.choices} style={{ height: showChoices ? '60rem' : '0', overflow: showChoices ? 'scroll' : 'hidden' }}>
            {/* Best Suggestion */}
            <div>
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
                        <button>Order this one</button>
                    </div>
                </div>
            </div>

            {/* All Suggestions */}
            <div>
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
                            <button>Order this one</button>
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
                            <button>Order this one</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* All Choices */}
            <div>
                <h2>All Choices</h2>
                <div className={style.groupItem}>
                    {
                        allChoices?.map((items) => {
                            return <div onClick={() => selecting(items._id)} style={{ boxShadow: selectChoices.includes(items._id) ? 'inset 0px 0px 4px 2px black' : '0px 0px 4px 2px black' }} className={style.singleItem}>
                                <h4>{items.wagonNumber}</h4>
                                <h4>{items.remaining}</h4>
                            </div>
                        })
                    }
                    <div className={style.confirmationButton}>
                        <button onClick={() => onOrdering(selectChoices)}>Order selected</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Choices