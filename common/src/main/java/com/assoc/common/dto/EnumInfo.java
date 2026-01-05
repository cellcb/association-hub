package com.assoc.common.dto;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class EnumInfo {
    
    private String code;
    private String name;
    
    public EnumInfo() {}
    
    public EnumInfo(String code, String name) {
        this.code = code;
        this.name = name;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public static <E extends Enum<E>> List<EnumInfo> fromEnums(E[] enums) {
        return Arrays.stream(enums)
                .map(e -> {
                    String code = e.name();
                    String name = getEnumDescription(e);
                    return new EnumInfo(code, name);
                })
                .collect(Collectors.toList());
    }
    
    private static String getEnumDescription(Enum<?> enumValue) {
        try {
            return (String) enumValue.getClass().getMethod("getDescription").invoke(enumValue);
        } catch (Exception e) {
            return enumValue.name();
        }
    }
}
