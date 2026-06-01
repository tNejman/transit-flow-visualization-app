package com.transitflow.visualization_app.model;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.usertype.UserType;

import java.io.Serializable;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Objects;
import java.util.UUID;

public class HexStringToUUIDUserType implements UserType<UUID> {

    @Override
    public int getSqlType() {
        return Types.VARCHAR;
    }

    @Override
    public Class<UUID> returnedClass() {
        return UUID.class;
    }

    @Override
    public boolean equals(UUID x, UUID y) {
        return Objects.equals(x, y);
    }

    @Override
    public int hashCode(UUID x) {
        return Objects.hashCode(x);
    }

    @Override
    public UUID nullSafeGet(ResultSet rs, int position, SharedSessionContractImplementor session, Object owner) throws SQLException {
        String hex = rs.getString(position);
        if (hex == null || hex.isBlank()) {
            return null;
        }
        // Jeśli z bazy leci 32-znakowy hex, wstawiamy myślniki, żeby UUID.fromString go przyjął
        if (hex.length() == 32) {
            String withDashes = hex.replaceFirst(
                "(\\w{8})(\\w{4})(\\w{4})(\\w{4})(\\w{12})",
                "$1-$2-$3-$4-$5"
            );
            return UUID.fromString(withDashes);
        }
        return UUID.fromString(hex);
    }

    @Override
    public void nullSafeSet(PreparedStatement st, UUID value, int index, SharedSessionContractImplementor session) throws SQLException {
        if (value == null) {
            st.setNull(index, Types.VARCHAR);
        } else {
            // Przy zapisie usuwamy myślniki, żeby zachować format char(32)
            st.setString(index, value.toString().replace("-", ""));
        }
    }

    @Override
    public UUID deepCopy(UUID value) {
        return value; // UUID jest niemutowalny
    }

    @Override
    public boolean isMutable() {
        return false;
    }

    @Override
    public Serializable disassemble(UUID value) {
        return value;
    }

    @Override
    public UUID assemble(Serializable cached, Object owner) {
        return (UUID) cached;
    }
}