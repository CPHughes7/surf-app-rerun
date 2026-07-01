import { useState, useEffect } from "react"

export default function Test() {

    const [str, setStr] = useState("Test")

    useEffect(() => {
        fetch("http://localhost:8000/api/hello")
        .then((res) => res.json())
        .then((word) => setStr(word["string"].toString()))
    }, [])
    return (
        <h1> Test </h1>
    )
    ;
}