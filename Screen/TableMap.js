import { View, Text , StyleSheet , TouchableOpacity} from 'react-native'
import { colors } from '../src/style/theme'
import { getAllTable, insertTable } from '../database/db.js'
import { useSQLiteContext } from 'expo-sqlite'
import { useEffect, useState } from 'react'

function TableMap() {

    const db = useSQLiteContext()

    const initTables = [
        { table_name: 'T1', 
        status: 'available'
        },
        { table_name: 'T2', 
        status: 'available'
        },
        { table_name: 'T3', 
        status: 'available'
        },
        { table_name: 'T4', 
        status: 'available'
        },
        { table_name: 'T5', 
        status: 'available'
        },
        { table_name: 'T6', 
        status: 'available'
        },
        { table_name: 'T7', 
        status: 'available'
        },
        { table_name: 'T8', 
        status: 'available'
        },
        { table_name: 'T9', 
        status: 'available'
        },
        { table_name: 'T10', 
        status: 'available'
        },
        { table_name: 'T11', 
        status: 'available'
        },
        { table_name: 'T12', 
        status: 'available'
        },
        { table_name: 'T13', 
        status: 'available'
        },
        { table_name: 'T14', 
        status: 'available'
        },
        { table_name: 'T15', 
        status: 'available'
        },
    ]
    
    const [tables, setTables] = useState([])

    useEffect(() => {
        const loadTable = async () => {
            await insertTable(db, initTables)

            const AllTables = await getAllTable(db)
            setTables(AllTables)
        }
        loadTable()
    }, [])

    return (
        <View style={style.content}>
            <View style={style.top}>
                <Text style={{fontSize: 50,fontWeight:'bold'}}>Table</Text>
            </View>

            <View style={style.statustable}>
                <Text style={{fontSize: 15}}>จำนวนโต๊ะที่ว่าง : 13  <View style={{backgroundColor:colors.red,width:15,height:15}}></View></Text>
                <Text style={{fontSize: 15}}>จำนวนโต๊ะที่ไม่ว่าง : 2  <View style={{backgroundColor:colors.dim,width:15,height:15}}></View></Text>
            </View>

            <View style={style.tables}>
                {tables.map((table) => (
                    <TouchableOpacity
                        key={table.table_id}
                        style={style.table_btn}
                    >
                        <Text style={style.numtable}>{table.table_name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

const style = StyleSheet.create({
    top:{
        alignItems:'center',
        marginTop:20,
        marginBottom:10
    },

    tables: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    table_btn: {
        width: 80,
        height: 80,
        backgroundColor: colors.dim,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
})



export default TableMap