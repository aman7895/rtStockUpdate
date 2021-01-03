import React, { useState, useEffect } from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import axios from 'axios';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { TextField } from '@material-ui/core';

const useStyles = makeStyles({
  table: {
    maxWidth: 350,
  },
});

const paginationStyle = makeStyles((theme) => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
}));

function TablePaginationActions(props) {
  const classes = paginationStyle();
  const theme = useTheme();
  const { count, page, rowsPerPage, onChangePage } = props;

  const handleFirstPageButtonClick = (event) => {
    onChangePage(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onChangePage(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};


const data_config = require('./config.json')
console.log(data_config)
axios.post('http://127.0.0.1:8000/setConfiguration', data_config)
  .then(res => {
    console.log(res);
    console.log(res.data)
  })
  .catch(error => console.log(error));

function createStockData(data) {
  if (data == null) {
    return []
  }
  let stockData = [];

  Object.keys(data).map((x, i) => {
    let items = Object.values(data)[i];
    stockData.push([x, items]);
    return stockData;
  });

  return stockData;
}


const App = () => {
  const [page, setPage] = React.useState(0);

  // setting number of elements per page
  const [rowsPerPage, setRowsPerPage] = React.useState(100);

  const classes = useStyles();
  const [stocks, updateStocks] = useState({});
  const [barrier, setBarrier] = useState({});

  let ws = null;

  useEffect(() => {
    console.log('Will establish websocket')
    ws = new WebSocket("ws://localhost:8000/ws");
  }, []);

  useEffect(() => {
    if (ws != null) {
      ws.onmessage = function (event) {
        let temp = JSON.parse(event.data)
        updateStocks(prevState => {
          Object.keys(temp).forEach(function (key) {
            let q = {}
            q[key] = temp[key]
            prevState = {
              ...prevState, ...q
            }
          }

          );
          return prevState;
        });
      }
    };
  }, [ws]);

  let rows = createStockData(stocks)

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 3));
    setPage(0);
  };

  const handleColorChange = (row, barrier) => {
    return row[1] > (row[0] in barrier ? barrier[row[0]] : 150) ? "green" : "red"
  };

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="paginated table">
        <TableHead>
          <TableRow>
            <TableCell>Stock</TableCell>
            <TableCell align="right">Prices</TableCell>
            <TableCell align="right">Barrier</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>

          {(rowsPerPage > 0
            ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : rows
          ).map((row) => (
            <TableRow key={row[0]} style={{ backgroundColor: handleColorChange(row, barrier) }}>
              <TableCell component="th" scope="row">
                {row[0]}
              </TableCell>
              <TableCell align="right">{row[1]}</TableCell>
              <TableCell>
                <TextField onChange={(event) => {
                  let temp = barrier;
                  temp[row[0]] = event.target.value;
                  setBarrier(temp);
                }} value={150}
                />
              </TableCell>
            </TableRow>
          ))}

          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={3} />
            </TableRow>
          )}

        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[20, 50, { label: 'All', value: -1 }]}
              colSpan={2}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: { 'aria-label': 'rows per page' },
                native: true,
              }}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}

export default App;