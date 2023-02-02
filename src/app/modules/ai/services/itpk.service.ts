import {Injectable} from "@angular/core";
import {environment} from "@env";
import {headerNoCache, HttpService} from "@modules/http/services/http.service";
import urljoin from "url-join";

export interface ItpkResponse {
  code: string; // 响应码，此值非00000都为异常状态码
  message: string; // 接口响应的消息提示，异常状态码可以参考此值的消息提示
  plugin: string | null; // 此次调用的最终处理插件，有Chat、Weather、Translation等，详细见下面插件列举，如果为null则表示是万金油回复
  data: {
    content: string; // typed为文本时，content表示回答文本内容；当data数组里面的typed为非文本，比如typed=2（图片）时，content表示此回答的图片文件相对地址
    typed: number; // 当前回复的类型，1：文本，2：图片，3：文档，4：音频，8：JSON字符串，9：其它文件；
    remark: string | null; // 附件上传时的原文件名, 词库回答里面的附件（图片、文档、音频和其它文件都是附件）访问地址是：https://files.molicloud.com/ + content
  }[]; // 当接口响应码为00000时，就会响应接口的正确数据
  baseUrl: string; // 附件访问地址
}

@Injectable({
  providedIn: "root"
})
export class ItpkService extends HttpService {
  baseURL = urljoin(environment.host, "api/itpk/");

  async ask(question: string) {
    const resposne = await this.get<ItpkResponse>(`${question}`, {}, headerNoCache);
    if (!resposne) {
      return null;
    }
    const itpkResponse = resposne.data;
    if (!itpkResponse) {
      return null;
    }
    return itpkResponse;
  }
}
