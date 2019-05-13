import {JSONSchema6} from "json-schema"
import React, {useEffect, useState} from "react"
import Form from "react-jsonschema-form"
import "./App.css"
import {Settings} from "./types"

function getUrl() {
    return (window as any).CONFIGURATOR_HOST || "localhost:5000"
}
function getSchema() {
    return JSON.parse((window as any).CONFIGURATOR_SCHEMA || "{}")
}
const baseUrl = `http://${getUrl()}/settings`

async function getInitialSettings(passcode: string): Promise<Settings> {
    const response = await fetch(`${baseUrl}/${passcode}`)
    return await response.json()
}

async function updateSettings(passcode: string, settings: Settings) {
    const response = await fetch(`${baseUrl}/${passcode}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
    })
    if (response.ok && (await response.json()).success === true) {
        alert("Successfully updated settings")
    } else {
        alert("Failed to update settings...")
    }
}

function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.log(error)
            return initialValue
        }
    })

    const removeItem = () => window.localStorage.removeItem(key)

    const setValue = (value: T | ((initial: T) => T)) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch (error) {
            console.log(error)
        }
    }

    return [storedValue, setValue, removeItem] as const
}

function usePasscode() {
    const [passcode, setPasscode, removePasscode] = useLocalStorage(
        "passcode",
        ""
    )

    useEffect(() => {
        if (!passcode) {
            setPasscode(prompt("Please enter your passcode here") || "")
        }
    }, [passcode, setPasscode])

    return [passcode, removePasscode] as const
}

function useSettingsWithInitial(passcode: string) {
    const [initialSettings, setInitialSettings] = useState<Settings>()
    useEffect(() => {
        ;(async () => {
            setInitialSettings(await getInitialSettings(passcode))
        })()
    }, [passcode])
    return [initialSettings, setInitialSettings] as const
}

const App: React.FC = () => {
    const [passcode, removePasscode] = usePasscode()
    const [settings, setSettings] = useSettingsWithInitial(passcode)
    if (!passcode || !settings) {
        return <div>Loading...</div>
    }

    return (
        <div className="formContainer">
            <div className="form">
                <Form<Settings>
                    schema={getSchema() as JSONSchema6}
                    formData={settings!}
                    onChange={({formData}) => setSettings(formData)}
                    onSubmit={async ({formData}) =>
                        await updateSettings(passcode, formData)
                    }
                    onError={e => {
                        alert(
                            "Could not validate form. Check console for more information."
                        )
                        console.error(e)
                    }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between"
                        }}>
                        <button className="btn btn-success" type="submit">
                            Submit
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={() => {
                                removePasscode()
                                document.location.reload()
                            }}>
                            Logout
                        </button>
                    </div>
                </Form>
            </div>
        </div>
    )
}

export default App
