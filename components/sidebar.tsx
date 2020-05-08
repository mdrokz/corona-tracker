import React from 'react';

import Card from '@material-ui/core/Card';
import CardHeader from "@material-ui/core/CardHeader";
// import CardMedia from '@material-ui/core/CardMedia';
import MenuItem from '@material-ui/core/MenuItem';
import CardContent from '@material-ui/core/CardContent';
import Select from '@material-ui/core/Select';
import { CoronaData } from '../types/coronaData';

import './css/arrow.scss';
import './css/index.scss';
import { TextField, Button } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { contextData } from '../types/reactTypes';

interface SidebarProps {
    cData: CoronaData[],
    ctxData: contextData,
    clearIndex: Function
}

class SideBar extends React.Component<SidebarProps> {
    state = {
        leftOpen: false,
        rightOpen: false,
        text: "⮜⮜",
        class: "",
        selectValue: 'Infection',
        inputValue: '',
        cData: [],
        cData2: []
    };
    constructor(props: SidebarProps) {
        super(props);
        console.log(props);
    }

    static getDerivedStateFromProps(props: SidebarProps, state) {
        // console.log(props, state)
        if (props.cData && state.cData.length == 0) {
            return { cData: props.cData, cData2: props.cData }
        }

        return null;
    }

    componentDidUpdate(prevProps: SidebarProps) {
        if (this.props.ctxData.index !== prevProps.ctxData.index && this.props.ctxData.index != null) {
            let data = [this.props.cData[this.props.ctxData.index]]
            this.setState({ leftOpen: this.props.ctxData.leftOpen,cData2:data });
        }

    }

    toggleSidebar = (event) => {
        let key = `${event.currentTarget.parentNode.id}Open`;
        this.setState({ [key]: !this.state[key]});
        if(this.state.leftOpen == false) {
            this.setState({cData2:this.props.cData});
        } else {
            this.props.clearIndex();
        }
        
    }

    onSelect = (event) => {
        this.setState({ selectValue: event.target.value })
    }

    onInput = (event) => {
        this.setState({ inputValue: event.target.value })
    }

    onSubmit = (_) => {
        //event.preventDefault();
        var x = this.state.cData.filter(v => {
            var l = v.country.toLowerCase()
            return l.includes(this.state.inputValue.toLowerCase());
        });
        if (this.state.inputValue.length != 0)
            this.setState({ cData2: x });
        else
            this.setState({ cData2: this.props.cData });

        return false
    }

    render() {
        let leftOpen = this.state.leftOpen ? 'open' : 'closed';
        // let rightOpen = this.state.rightOpen ? 'open' : 'closed';
        let transition = leftOpen == 'open' ? 't-left' : '';

        return (
            <>

                <div id='layout'>
                    <div id='left' className={leftOpen} >
                        {/* <div className='icon'
                            onClick={this.toggleSidebar} >
                            &equiv;
              </div> */}
                        <a className={transition} id="arrow" href="#" onClick={this.toggleSidebar} >
                            <span>⮜</span>
                        </a>
                        <div className={`sidebar ${leftOpen}`} >
                            <div>
                                <Select
                                    labelId="demo-simple-select-filled-label"
                                    id="demo-simple-select-filled"
                                    className='bar_header bar_space'
                                    value={this.state.selectValue}
                                    onChange={this.onSelect}
                                    autoWidth={true}
                                >
                                    <MenuItem value={'News'}>WHO News</MenuItem>
                                    <MenuItem value={'Guidelines'}>WHO Guidelines</MenuItem>
                                    <MenuItem value={'Infection'}>C19 Data</MenuItem>
                                </Select>
                                <form noValidate autoComplete="off" onSubmit={this.onSubmit}>
                                    <TextField className="bar_space" label="Country" onChange={this.onInput}></TextField>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<SearchIcon />}
                                        style={{ margin: '16px' }}
                                        type="submit"
                                    >
                                        Search
                                    </Button>
                                </form>
                                {/* <h3 className='title' >
                                    Under Construction
                            </h3> */}
                            </div>

                            <div className='content'>
                                {this.state.cData ? this.state.cData2.map((data, index) => {
                                    return (
                                        <Card key={index} className="m_card">
                                            <img src={data.countryInfo.flag} />
                                            <CardHeader title={data.continent + ',' + data.country} />
                                            <CardContent>
                                                <p>
                                                    Under Construction
                                                </p>
                                            </CardContent>
                                        </Card>

                                    );
                                }) : null}
                            </div>
                        </div>
                    </div>
                    {this.props.children}
                </div>
            </>
        );
    }
}

export default SideBar;