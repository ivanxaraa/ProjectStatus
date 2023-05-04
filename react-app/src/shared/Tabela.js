import * as React from "react";
import "react-tabulator/lib/styles.css"; // required styles
import "react-tabulator/lib/css/tabulator.min.css"; // theme
import { ReactTabulator } from "react-tabulator";
import "../../styles/tabulator.css";

const Tabela = ({ data, columns, mostrarDeleteBtn = false, handleViewCode = false }) => {
  let ref = React.useRef();

  const [options, setOptions] = React.useState({
    columnMinWidth: 50,
  });

  return (
    <>
      {data.length > 0 && mostrarDeleteBtn ? (
        <ReactTabulator
          onRef={(r) => {
            ref = r;
            ref.current.on("rowSelectionChanged", function (data, row) {
              mostrarDeleteBtn(data);
            });
            ref.current.on("rowClick", function (mouse, row) {
              const data = row['_row'].data;
              const {function_id, language} = data;
              handleViewCode(function_id, language);
            });
          }}
          data={data}
          columns={columns}
          options={options}
        />
      ) : (
        <ReactTabulator data={data} columns={columns} options={options} />
      )}
    </>
  );
};

export default Tabela;
