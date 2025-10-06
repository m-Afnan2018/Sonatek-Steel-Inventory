const suggestions = (requirement, array, index, answer, subarrays) => {
    if (array.length >= index) {
        return;
    }
    if (requirement === 0) {
        subarrays.push(answer);
    }

    suggestions(requirement - array[index], array, index + 1, [...answer, array[index]], subarrays);
    suggestions(requirement, array, index + 1, answer, subarrays);
}