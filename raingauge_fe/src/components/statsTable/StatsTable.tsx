import styles from './StatsTable.module.scss';


type T_StatsTableProps = {
    tableData : T_StatsTableRowData[]
}

type T_StatsTableRowData = {
    heading : string,
    wettest: T_HydroSuperlativeData,
    driest: T_HydroSuperlativeData,
}

type T_HydroSuperlativeData = {
    description : string,
    total : number,
    replaceTotal? : string,
}


export function StatsTable({ tableData } : T_StatsTableProps){
    return (
        <div className={"col-12 col-xl-8"}>
        <table className="table">
            <thead className={ styles.tableHead }>
                <tr>
                    <th scope="col">Time Unit</th>
                    <th scope="col">Wettest</th>
                    <th scope="col">Driest</th>
                </tr>
            </thead>
            <tbody>
            { tableData.map((rowData : T_StatsTableRowData) => {
                return (
                    <tr key={ rowData.heading.replaceAll(" ", "") }>
                        <th scope="row">{ rowData.heading }</th>
                        <CellForSuperlativeData data = { rowData.wettest } />
                        <CellForSuperlativeData data = { rowData.driest } />
                    </tr>
                )
            })
            }
            </tbody>
        </table>
        </div>
    )
}

type T_CellForSuperlativeDataProps = {
    data : T_HydroSuperlativeData,
}

function CellForSuperlativeData({ data } : T_CellForSuperlativeDataProps){
    return (
        <td>
            <div style={{display: "flex", flexDirection:"column"}}>
            <strong>{ data.replaceTotal === undefined 
                ? <>{ `${Math.round(data.total * 100) / 100}` }&nbsp;mm</>
                : data.replaceTotal
            }
            </strong>
            <span>{ data.description }
            </span>
            </div>
        </td>
    )
}