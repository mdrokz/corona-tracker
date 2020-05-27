import Card from '@material-ui/core/Card';
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from '@material-ui/core/CardContent';

import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { memo, useState } from 'react';
import { Button } from '@material-ui/core';
import { CoronaData } from '../types/coronaData';
import { List } from 'react-virtualized';

const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.default,
        border: '2px solid #000',
        borderRadius: '9px',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

export function CardModal(props: { infected?: CoronaData, selected: string, paragraph?: string, isMobile: boolean, open: boolean }) {
    const classes = useStyles();
    const [open, setOpen] = useState(props.open);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            {!props.isMobile && <Button
                variant="outlined"
                color="primary"
                type="submit"
                onClick={handleOpen}
            >
                Open
            </Button>}

            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open}>
                    <div className={classes.paper}>
                        {/* {props.selected == 'Infection' ? <InfectionData infected={props.infected}></InfectionData> : props.selected == 'News' ? <NewsData></NewsData> : null} */}
                        {props.selected == 'Infection' && <InfectionData infected={props.infected}></InfectionData>}
                        {props.selected == 'News' && <NewsData paragraph={props.paragraph}></NewsData>}
                    </div>
                </Fade>
            </Modal>
        </div>
    );
}

export function InfectionData(props: { infected: CoronaData }) {
    return (<>
        <h1 id="transition-modal-title">Infection Data</h1>
        <h2>{props.infected.country}</h2>
        <span>
            Active:  <p>{props.infected.active}</p>
            <br />
            Cases: <p>{props.infected.cases}</p>
            <br />
            CasesPerOneMillion: <p>{props.infected.casesPerOneMillion}</p>
            <br />
            Critical: <p>{props.infected.critical}</p>
            <br />
            Deaths: <p>{props.infected.deaths}</p>
            <br />
            Recovered: <p>{props.infected.recovered}</p>
            <br />
            CasesToday: <p>{props.infected.todayCases}</p>
            <br />
            DeathsToday: <p>{props.infected.todayDeaths}</p>
        </span>
    </>)
}

export function NewsData(props) {
    return (<>
        <h1 id="transition-modal-title">News Body</h1>
        <p>
            {props.paragraph}
        </p>
    </>)
}

const InfectionCardMemo = (props: { cData2: any[], selectValue: string }) => {
    return (<>
        <List
            width={400}
            height={1000}
            rowHeight={330}
            rowRenderer={({ index, key, style }) => InfectionCardRenderer({ index, key, style }, props.cData2, props.selectValue)}
            rowCount={props.cData2.length}
            overscanRowCount={3} />
    </>)
}

const InfectionCardRenderer = ({ index, key, style }, data: any, selectValue: string) => {
    return (
        <Card key={key} style={style} className="m_card">
            <img src={data[index].countryInfo.flag} />
            <CardHeader title={data[index].continent + ',' + data[index].country} />
            <CardContent>
                <span>
                    <CardModal isMobile={false} open={false} infected={data[index]} selected={selectValue}></CardModal>
                </span>
            </CardContent>
        </Card>

    )
};

export const InfectionCard = memo(InfectionCardMemo);

const NewsCardMemo = (props: { newsData: string[], selectValue: string, paragraph: string[] }) => {
    return (<>
        <List width={400}
            height={1000}
            rowHeight={220}
            rowRenderer={({ index, key, style }) => NewsCardRenderer({ index, key, style }, props.newsData, props.selectValue, props.paragraph)}
            rowCount={props.newsData.length}
            overscanRowCount={3}>
        </List>
    </>)
}

const NewsCardRenderer = ({ index, key, style }, newsData: string[], selectValue: string, paragraph: string[]) => {
    return (<>
        <Card key={key} style={style} className="m_card">
            <CardHeader title={newsData[index]} />
            <CardContent>
                <span>
                    <CardModal isMobile={false} open={false} paragraph={paragraph[index]} selected={selectValue}></CardModal>
                </span>
            </CardContent>
        </Card>
    </>)
}

export const NewsCard = memo(NewsCardMemo);

export function GuidelinesCard(props) {
    return (<></>)
}
