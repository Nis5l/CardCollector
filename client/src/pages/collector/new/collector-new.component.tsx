import { useState } from "react";
import { CardComponent } from "../../../shared/components";
import { useAxiosPrivate } from "../../../hooks";

import "./collector-new.component.scss";

function CollectorNewComponent(){
    const [ disabled, setDisabled ] = useState(true);
    const [ name, setName ] = useState("");
    const axios = useAxiosPrivate();

    const onClick = () => {
        setDisabled(true);
        axios.post("/collector/create", { name }).then((res: any) => {
            const collectorID: string = res.data.id;
            console.log(collectorID);
        });
    }

    return (
        <CardComponent
            title="Create Collector"
            styleClassName="create-collector-card"
        >
            <div className="create-collector-card-content">
                <input
                    type="text"
                    autoComplete="false"
                    className="text_input"
                    name="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        const newDisabled = e.target.value.length <= 5;
                        if(newDisabled !== disabled){
                            setDisabled(newDisabled);
                        }
                    }}
                />
                <input className="button_input" type="submit" name="submit" value="Create" onClick={onClick} disabled={disabled} />
            </div>
        </CardComponent>
    )
}

export default CollectorNewComponent;
