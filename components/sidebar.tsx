import React from 'react';

// import Card from '@material-ui/core/Card';
// import CardHeader from "@material-ui/core/CardHeader";
// import CardMedia from '@material-ui/core/CardMedia';
import MenuItem from '@material-ui/core/MenuItem';
// import CardContent from '@material-ui/core/CardContent';
import Select from '@material-ui/core/Select';
import { CoronaData } from '../types/coronaData';

import './css/arrow.scss';
import './css/index.scss';
import { TextField, Button } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { contextData, WhoData } from '../types/reactTypes';
import { InfectionCard, NewsCard } from './cards';

interface SidebarProps {
    cData: CoronaData[],
    ctxData: contextData,
    clearIndex: Function,
    getWhoNews(): Promise<WhoData>
}

class SideBar extends React.Component<SidebarProps> {
    state = {
        leftOpen: false,
        rightOpen: false,
        text: "⮜⮜",
        class: "",
        selectValue: 'Infection',
        inputValue: '',
        newsData: [],
        paragraphData: [],
        cData: [],
        cData2: []
    };
    constructor(props: SidebarProps) {
        super(props);
    }

    static getDerivedStateFromProps(props: SidebarProps, state) {
        if (props.cData && state.cData.length == 0) {
            return { cData: props.cData, cData2: props.cData }
        }

        return null;
    }

    getuniqueValues(a) {
        var seen = {};
        return a.filter(function (item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
    }

    async getNews(): Promise<any[]> {
        let v = await this.props.getWhoNews();
        let decoder = new TextDecoder();
        let body: string[] = [];
        let pbody: string[] = [];
        let length = v.get_length(0);
        for (var x = 0; x < length[0]; x++) {
            let headerBytes = v.get_header(x);
            let b = v.get_bytes_length(x, 0)[0];
            let a = [];
            for (var i = 0; i < b; i++) {
                a.push(headerBytes[i])
            }

            let header = decoder.decode(new Uint8Array(a));

            if (header.length > 1) {
                body.push(header);
            }
        }

        for (var x = 0; x < length[1]; x++) {
            let headerBytes = v.get_paragraph(x);
            let b = v.get_bytes_length(0, x)[1];
            let a = [];
            for (var i = 0; i < b; i++) {
                a.push(headerBytes[i])
            }

            let paragraph = decoder.decode(new Uint8Array(a));

            if (paragraph.length > 1) {
                pbody.push(paragraph.trim());
            }
        }
        pbody = this.getuniqueValues(pbody);

        return new Promise((resolve, reject) => {
            if (body || pbody) {
                resolve([body, pbody])
            } else {
                reject(new Error("News Body is Null"));
            }
        })
    }

    async componentDidUpdate(prevProps: SidebarProps) {
        if (this.props.ctxData.index !== prevProps.ctxData.index && this.props.ctxData.index != null) {
            let data = [this.props.cData[this.props.ctxData.index]]
            this.setState({ leftOpen: this.props.ctxData.leftOpen, cData2: data, selectValue: 'Infection' });
        }
    }


    componentDidMount() {
        if (this.props.getWhoNews) {
            this.getNews().then(res => this.setState({ newsData: res[0], paragraphData: res[1] }));
            // this.setState({ newsData: body });
        }
    }

    toggleSidebar = (event) => {
        let key = `${event.currentTarget.parentNode.id}Open`;
        this.setState({ [key]: !this.state[key] });
        if (this.state.leftOpen == false && this.state.selectValue == 'Infection') {
            this.setState({ cData2: this.state.cData });
        } else if (this.state.selectValue == 'Infection') {
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
                                {/* {this.state.selectValue == 'Infection' ? InfectionCard(this.state) : this.state.selectValue == 'News' ? NewsCard(this.state) : null} */}
                                {this.state.selectValue == 'Infection' && <InfectionCard cData2={this.state.cData2} selectValue={this.state.selectValue}></InfectionCard>}
                                {this.state.selectValue == 'News' && <NewsCard newsData={this.state.newsData} selectValue={this.state.selectValue} paragraph={this.state.paragraphData}></NewsCard>}
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