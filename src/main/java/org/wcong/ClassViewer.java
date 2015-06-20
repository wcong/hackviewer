package org.wcong;

import lombok.Data;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

/**
 * class viewer
 * Created by wcong on 15/6/19.
 */
@Controller
public class ClassViewer {

    @Data
    public static class Result<T> {

        private boolean success;

        private String msg;

        private Integer code;

        private T data;

        public static <T> Result<T> success(T data) {
            Result<T> result = new Result<T>();
            result.setData(data);
            result.setSuccess(true);
            return result;
        }
    }

    @Data
    public static class ClassInfo {

        private String id;

        private String className;

        private String parentClass;

        private List<Interface> interfaces;

        private List<ClassField> fields;

    }

    @Data
    public static class Interface {
        private String type;
    }

    @Data
    public static class ClassField {
        private String type;

        private String name;
    }

    @RequestMapping("/")
    public String index() {
        return "index";
    }

    @RequestMapping(value = "/class", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Result<ClassInfo> getClassDesc(@RequestParam String className) throws ClassNotFoundException {
        Class<?> cls = getClass().getClassLoader().loadClass(className);
        ClassInfo classInfo = new ClassInfo();
        classInfo.setId(cls.getName().replace('.', '-'));
        classInfo.setClassName(cls.getName());
        if (cls.getSuperclass() != null) {
            classInfo.setParentClass(cls.getSuperclass().getName());
        }
        Field[] fields = cls.getDeclaredFields();
        List<ClassField> fieldList = new ArrayList<ClassField>(fields.length);
        classInfo.setFields(fieldList);
        for (Field field : fields) {
            ClassField classField = new ClassField();
            classField.setName(field.getName());
            classField.setType(field.getType().getName());
            fieldList.add(classField);
        }
        Class<?>[] interfaces = cls.getInterfaces();
        List<Interface> interfaceList = new ArrayList<Interface>(interfaces.length);
        classInfo.setInterfaces(interfaceList);
        for (Class<?> in : interfaces) {
            Interface itf = new Interface();
            itf.setType(in.getName());
            interfaceList.add(itf);
        }
        return Result.success(classInfo);
    }

}
