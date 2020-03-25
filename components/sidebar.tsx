import React from 'react';
import './css/arrow.scss';
import './css/index.scss';


class SideBar extends React.Component {
    state = {
        leftOpen: false,
        rightOpen: false,
        text: "⮜⮜",
        class: ""
    };
    constructor(props) {
        super(props);
        console.log(props);
    }

    toggleSidebar = (event) => {
        let key = `${event.currentTarget.parentNode.id}Open`;
        this.setState({ [key]: !this.state[key] });
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
                            <div className='header'>
                                <h3 className='title' >
                                    Under Construction
                    </h3>
                            </div>
                            <div className='content'>
                                <h3></h3>
                                <p>
                                </p>
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