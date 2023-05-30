import * as React from "react";
import "react-tabulator/lib/styles.css"; // required styles
import "react-tabulator/lib/css/tabulator.min.css"; // theme
import { ReactTabulator } from "react-tabulator";
import "../../styles/tabulator.css";

const Tabela = ({
  data,
  columns,
  handleSelectedData,
  handleViewCode,
  selectedData = [],
  type,
}) => {
  let ref = React.useRef();

  const [options, setOptions] = React.useState({
    movableRows: false,
    // autoResize:false,
  });

  const tableTypes = {
    delete: (r) => {
      ref = r;
      ref.current.on("rowSelectionChanged", function (data, row) {
        handleSelectedData(data);
      });
      // ref.current.on("rowClick", function (mouse, row) {
      //   const data = row["_row"].data;
      //   const { function_id, language } = data;
      //   handleViewCode(function_id, language);
      // });
    },
    shareProject: (r) => {
      ref = r;
      ref.current.on("tableBuilt", function (data) {
        ref.current.selectRow(selectedData);
      });
      ref.current.on("rowSelectionChanged", function(data, rows, selected, deselected){
        handleSelectedData(data);
    });
    },
  };

  return (
    <>
      <ReactTabulator
        onRef={tableTypes[type]}
        data={data}
        columns={columns}
        options={options}
      />
    </>
  );
};

export default Tabela;
