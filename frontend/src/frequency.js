import React, { useState, useEffect } from "react";
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: '25ch',
        },
    },
}));

const updateFrequency = (value) => {
    axios.post('http://127.0.0.1:8000/setFrequency', value)
        .then(res => {
            console.log(res);
            console.log(res.data)
        })
        .catch(error => console.log(error));
}

const Frequency = () => {
    const [frequency, setFreq] = useState();
    const classes = useStyles();

    return (
        <form className={classes.root} noValidate autoComplete="off">
            <div>
                <TextField
                    id="standard-number"
                    label="Frequency in milliseconds"
                    type="number"
                    InputLabelProps={{
                        shrink: true,
                    }}

                    onChange={(event) => {
                        let temp = event.target.value;
                        setFreq(temp);
                    }}
                />
                <Button onClick={() => updateFrequency()}>UPDATE</Button>
            </div>
        </form>
    );
}



export default Frequency;