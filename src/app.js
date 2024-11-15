
import { Base64 } from "base64-string";
import URLParse from "url-parse"

const ATMURL = (new Base64()).decode(URLParse(window.location.href).hash.slice(1));

// console.log(ATMURL);

$(document).ready(function() {

    let DataTable = $("#DATA_TABLE > tbody")
    let timer;

    DataTable.delegate("button", "click", function(){
        let uuid = $(this).parents("tr").find("td:first-child").text()
        $(this).parents("tr").remove()
        Pull([ATMURL].concat([uuid, 0]).join("/"))
    })

    const Render = function(data) {
        // console.log(data);
        DataTable.empty();
        if(data.length > 0) {
            $.each(data, function(_, row) {
                $("<tr><td>" + row.uuid + "</td><td>" + row.username + "</td><td class=\"text-end\">" + row.amount + "</td><td class=\"text-center\"><button class=\"btn btn-danger btn-sm\" type=\"button\">DELETE</button></td></tr>").appendTo(DataTable);
            })
        } else {
            $("<tr><td class=\"text-center\" colspan=\"4\"><em>No data</em></td></tr>").appendTo(DataTable);
        }
    }

    const Fail = function() {
        if(timer) window.clearInterval(timer);
        $(".container").empty().append(
            $("<div class=\"bg-danger-subtle border border-danger rounded p-3 mt-3 text-danger\">This address has expired</div>")
        )
    }

    let requestHandle = null;
    const Pull = function(url) {
        if(requestHandle != null) requestHandle.abort()
        requestHandle = $.ajax({
            url,
            jsonp: "callback",
            dataType: "jsonp",
            data: {}
        })
            .done(Render)
            .fail(Fail)
            .always(function() {
                requestHandle = null
            })
    }

    $("#ADD").on("click", function() {
        let newData = {UUID:"",AMOUNT:""};
        $(this).parent().find("input").each(function(){
            let value = $(this).val().trim();
            if(value == "") return false;
            newData[$(this).attr("name")] = value;
        })
        if(newData.UUID != "" && newData.AMOUNT != "") {
            $(this).parent().find("input").val("")
            Pull([ATMURL].concat(Object.values(newData)).join("/"));
        }
    })

    timer = setInterval(() => {
        Pull(ATMURL);
    }, 30000);
    Pull(ATMURL);
})
