/**通用
 * common
 */
(function () {
	function lxsmCommon(){
	};
	lxsmCommon.prototype={
		convertDate:function(date){
		      let d = new Date(date);  //传入时间
		      let month = (d.getMonth() + 1) < 10 ? '0'+(d.getMonth() + 1) : (d.getMonth() + 1);
		      let day = d.getDate()<10 ? '0'+d.getDate() : d.getDate();
		      let hours = d.getHours()<10 ? '0'+d.getHours() : d.getHours();
		      let min = d.getMinutes()<10 ? '0'+d.getMinutes() : d.getMinutes();
		      let sec = d.getSeconds()<10 ? '0'+d.getSeconds() : d.getSeconds();
		      let times=d.getFullYear() + '-' + month + '-' + day + " " + hours + ':' + min + ':' + sec;
		      return times;
		},
		getradio:function(e,background,clickColor){
			let event = e || event
			let element = event.currentTarget
			element.firstElementChild.firstElementChild.click()
			element.style.backgroundColor = clickColor
			let s = this.siblings(element)
			s.forEach((v,i)=>{
				v.style.backgroundColor = background
			})
		},
		clickSpan:function(e){
			let event = e || event
			event.stopPropagation();
		},
		//获取兄弟元素
		siblings:function(currentNode) {
			var siblingss = []; //用来存放其他的兄弟节点
			var elseLi = currentNode.parentNode.children;
			for (var i = 0, elseLil = elseLi.length; i < elseLil; i++) {
				if (elseLi[i] !== currentNode) {//判断是否是ele节点，是否与触发事件的节点相同
					siblingss.push(elseLi[i]);
				}
			}
			return siblingss;
		},
	}
	window.lxsmCommon = window.lxsmCommon || new lxsmCommon();
})();

/**table
 * 依赖common
 */
function lxsmTable(parameter){
	this.doc = document
	this.tableWrapper = parameter.tableWrapper
	this.background = parameter.background;
	this.clickColor = parameter.clickColor;
	this.tool = parameter.tool;
	this.operation = parameter.operation;
	this.pageNumber = parameter.pageNumber || 1;//初始化加载第一页，默认第一页
	this.pageSize = parameter.pageSize || 5;//每页的记录行数（*）
	this.pageList = parameter.pageList || [5, 15, 20, 25, 50, 100];//可供选择的每页的行数（*）
	this.columns = parameter.columns
	this.url = parameter.url
	this.queryParams ={}
	this.tableData={}
	this.pageCount = 0
	this.init(this.queryParams)
}
lxsmTable.prototype = {
	init:function(queryParams,flag){
		flag ? this.pageNumber = this.pageNumber : this.pageNumber = 1
		let _this = this;
		this.queryParams = queryParams
		this.queryParams.pageNumber = (_this.pageNumber-1) * _this.pageSize
		this.queryParams.pageSize =  _this.pageSize
		this.getTableData(this.queryParams,(data)=>{
			_this.tableData.data = data.data
			_this.tableData.count = data.count.counts
			_this.pageCount = Math.ceil(_this.tableData.count / _this.pageSize);
			console.log(_this.tableData)
			// _this.tableData.currentData = _this.tableData.data.filter((v,i)=>{
			// 	return  i >= (_this.pageNumber-1) * _this.pageSize  && i < _this.pageNumber * _this.pageSize;
			// })
			_this.clearEleme();
			_this.creatEleme();
		})
		
	},
	clearEleme:function(){
		let lxsm = this.doc.querySelectorAll(".lxsm")[0];
		if(lxsm){
			lxsm.parentNode.removeChild(lxsm);
		}
	},
	creatEleme:function(){
		let _this = this;
		let _background = this.background;
		let _clickColor = this.clickColor;
		let getPagination = this.setPagination()
		var tableBox = this.doc.createElement('div');
		tableBox.className = "lxsm";
		var tableTool = this.doc.createElement('div');
		tableTool.className = "lxsmTool";
		tableTool.innerHTML = `
			${this.tool.map(item=>{
			   return `<button onclick="(${item.handler})()">${item.title}</button>`
		    }).join('')}
		`
		tableBox.appendChild(tableTool);
		let table = this.doc.createElement('table');
		table.className = "lxsmTable";
		table.setAttribute("border",1)
		table.innerHTML =`
				<thead>
				<tr>
				${this.columns.map(item=>{
					if(!item.hidden){
						return `<th>${item.title}</th>`
					}
				 }).join('')}
				</tr>
				</thead>
				<tbody>
					${
						this.tableData.data.length <= 0 ?  "<tr>暂无数据</tr>" : ""
					}
					 ${this.tableData.data.map((item,index)=>{
						return ` <tr onclick="lxsmCommon.getradio(event,'${_background}','${_clickColor}')">
							${this.columns.map(item2=>{
								if(!item2.hidden){
									let html = ''
									if(item2.checkbox){
										html = `<td><input type='checkbox' name="lxsmCheck" onclick="lxsmCommon.clickSpan(event)" value="${item.logId}"></td>`
									}else if(item2.radio){
										html += `<td><input type="radio" name="lxsmCheck" onclick="lxsmCommon.clickSpan(event)" value="${item.logId}"></td>`
									}else if(item2.operation){
										html += ` <td>
										${this.operation.map(item3=>{
										   return `<span class="lxsmOperation" onclick="(${item3.handler})(${item.logId})">${item3.title}</span>`
										 }).join('')}
										</td>`
									}else{
										html += `<td>${item2.handler ? (item2.handler)(item[item2.fieId]) : item[item2.fieId]}</td>`
									}
								   return html
							   }
							 }).join('')}
							</tr>`
					  }).join('')}
				</tbody>
				
				<tfoot>
				<tr>
				</tr>
				</tfoot>
		`;
		tableBox.appendChild(table);
		var tablePagination = this.doc.createElement('div');
		tablePagination.className = "lxsmPagination";
		// <select onchange="(${this.changePagination})(this.value)">
		// <button class="lxsmPaginationActive">1</button>
		tablePagination.innerHTML = `<div>
					每页显示
					<select>
						${this.pageList.map(item=>{
						   return `
							   <option value="${item}" ${item == this.pageSize ? "selected" : ""}>${item}</option>
						   `
						 }).join('')}
					</select>
					条记录，	共 ${this.tableData.count} 条记录
				</div>
				<div>
					<button class="lxsmPaginationHome">首页</button>
					<button class="lxsmPaginationPre">上一页</button>
					${getPagination.map(item=>{
						   return `
							   <button value="${item}" ${item == this.pageNumber ? 'class="lxsmPaginationBtn lxsmPaginationActive"' : 'class="lxsmPaginationBtn"' }>${item}</button>
						    `
					}).join('')}
					<button class="lxsmPaginationNext">下一页</button>
					<button class="lxsmPaginationEnd">尾页</button>
				</div>`
	    tableBox.appendChild(tablePagination);
	    this.doc.getElementById(this.tableWrapper).appendChild(tableBox);
		let select = this.doc.querySelectorAll(".lxsm select")[0]
		let lxsmPaginationBtn = this.doc.querySelectorAll(".lxsm .lxsmPaginationBtn")
		select.onchange=function(){
			_this.changePagination(this.value,0)
		}
		lxsmPaginationBtn.forEach((val)=>{
			val.onclick = function(){
				_this.changePagination(this.value,1)
			}
		})
		let lxsmPaginationHome = this.doc.querySelectorAll(".lxsm .lxsmPaginationHome")[0]
		let lxsmPaginationPre = this.doc.querySelectorAll(".lxsm .lxsmPaginationPre")[0]
		let lxsmPaginationNext = this.doc.querySelectorAll(".lxsm .lxsmPaginationNext")[0]
		let lxsmPaginationEnd = this.doc.querySelectorAll(".lxsm .lxsmPaginationEnd")[0]
		lxsmPaginationHome.onclick=function(){
			_this.pageNumber =  1
			_this.changePagination(_this.pageNumber,1)
		}
		lxsmPaginationPre.onclick=function(){
			_this.pageNumber --
			if(_this.pageNumber < 1){
				_this.pageNumber = 1
			}
			
			_this.changePagination(_this.pageNumber,1)
		}
		lxsmPaginationNext.onclick=function(){
			_this.pageNumber ++
			if(_this.pageNumber > _this.pageCount){
				_this.pageNumber = _this.pageCount
			}
			_this.changePagination(_this.pageNumber,1)
		}
		lxsmPaginationEnd.onclick=function(){
			_this.pageNumber =  _this.pageCount
			_this.changePagination(_this.pageNumber,1)
		}
	},
	setPagination:function(){
		let arr =[]
		if(this.pageCount > 5){
			if(this.pageNumber > 3 && this.pageNumber * this.pageSize < this.tableData.count -this.pageSize){
				arr = Array.from({length:5}, (v,k) => (k+(this.pageNumber -2)));
			}else if(this.pageNumber * this.pageSize >= this.tableData.count -this.pageSize && this.pageNumber * this.pageSize < this.tableData.count){
				arr = Array.from({length:5}, (v,k) => (k+(this.pageNumber - 3)));
			}else if(this.pageNumber * this.pageSize >= this.tableData.count){
				arr = Array.from({length:5}, (v,k) => (k+(this.pageNumber -4)));
			}else{
				arr = Array.from({length:5}, (v,k) => (k+1));
			}
			
		}else{
			arr = Array.from({length:this.pageCount}, (v,k) => (k+1));
		}
		return arr;
	},
	getTableData:function(queryParams,call){
		let _this = this;
		_this.ajax({
			url:_this.url,
			type:'post',
			data:queryParams,
			dataType:'json',
			timeout:10000,
			contentType:"application/json",
			success:function(data){
				call && call(JSON.parse(data))
			},
			error:function(e){
				console.log(e);
			}
		});
	},
	formatParams:function(data){
        var arr=[];
        for(var name in data){
            arr.push(encodeURIComponent(name)+"="+encodeURIComponent(data[name]));
        }
        arr.push(("v="+Math.random()).replace(".",""));
        return arr.join("&");

    },
	ajax:function(options){
		options = options ||{};  //调用函数时如果options没有指定，就给它赋值{},一个空的Object
        options.type=(options.type || "GET").toUpperCase();/// 请求格式GET、POST，默认为GET
        options.dataType=options.dataType || "json";    //响应数据格式，默认json

        var params=this.formatParams(options.data);//options.data请求的数据

        var xhr;

        //考虑兼容性
        if(window.XMLHttpRequest){
            xhr=new XMLHttpRequest();
        }else if(window.ActiveObject){//兼容IE6以下版本
            xhr=new ActiveXobject('Microsoft.XMLHTTP');
        }

        //启动并发送一个请求
        if(options.type=="GET"){
            xhr.open("GET",options.url+"?"+params,true);
            xhr.send(null);
        }else if(options.type=="POST"){
            xhr.open("post",options.url,true);

            //设置表单提交时的内容类型
            //Content-type数据请求的格式
            xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            xhr.send(params);
        }

    //    设置有效时间
        setTimeout(function(){
            if(xhr.readySate!=4){
                xhr.abort();
            }
        },options.timeout)

    //    接收
    //options.success成功之后的回调函数  options.error失败后的回调函数
    //xhr.responseText,xhr.responseXML  获得字符串形式的响应数据或者XML形式的响应数据

        xhr.onreadystatechange=function(){
            if(xhr.readyState==4){
                var status=xhr.status;
                if(status>=200&& status<300 || status==304){
                  options.success&&options.success(xhr.responseText,xhr.responseXML);
                }else{
                    options.error&&options.error(status);
                }
            }
        }
		
	},
	refresh:function(){
		console.log(11)
	},
	getSelectedItems:function(){
		let check = this.doc.querySelectorAll('input[name="lxsmCheck"]')
		check= [...check];
		let newCheck = check.filter((v,i)=>{
			return v.checked
		})
		let data = this.tableData.data.filter((v,i)=>{
			return  newCheck.some((v2, i2)=>{
				return v.logId == v2.value
			 });
		})
		return data
	},
	getSelectedItemId:function(id){
		let data = this.tableData.data.filter((v,i)=>{
				return v.logId == id
		})
		return data
	},
	changePagination:function(val,flag){
		if(flag == 0){
			this.pageSize =  val
		}else if(flag == 1){
			this.pageNumber =  val
		}
		this.init(this.queryParams,'pagination')
	}
}		



