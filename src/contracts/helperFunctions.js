// Written by DuckySoLucky or Senither


function addNotation(type, value) {
    let returnVal = value
    let notList = []
    if (type === "shortScale") {
        notList = [
            " Thousand",
            " Million",
            " Billion",
            " Trillion",
            " Quadrillion",
            " Quintillion"
        ]
    }

    if (type === "oneLetters") {
        notList = [" K", " M", " B", " T"]
    }

    let checkNum = 1000
    if (type !== "none" && type !== "commas") {
        let notValue = notList[notList.length - 1]
        for (let u = notList.length; u >= 1; u--) {
            notValue = notList.shift()
            for (let o = 3; o >= 1; o--) {
                if (value >= checkNum) {
                    returnVal = value / (checkNum / 100)
                    returnVal = Math.floor(returnVal)
                    returnVal = (returnVal / Math.pow(10, o)) * 10
                    returnVal = +returnVal.toFixed(o - 1) + notValue
                }
                checkNum *= 10
            }
        }
    } else {
        returnVal = numberWithCommas(value.toFixed(0))
    }

    return returnVal
}


function addCommas(num) {
    try {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    } catch (error) {
        return 0
    }
}


module.exports = { addNotation, addCommas }